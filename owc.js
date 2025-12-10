// @ts-check
// DOC entire file
/**
 * A warband calculator for the "Song of Blades and Heroes" fantasy tabletop skirmish rules.
 * @copyright (c) 2025 Christoph Zager
 * @license AGPL-3.0 https://www.gnu.org/licenses/agpl-3.0.en.html
 * @link https://github.com/chzager/sbhowc
 */
const owc = new class OnlineWarbandCalculator
{
	get meta ()
	{
		return Object.freeze({
			title: "Online Warband Calculator for Song of Blades and Heroes",
			// version: "Feb22 release",
			version: "Nov25 development",
			origin: "https://chzager.github.io/sbhowc",
		});
	}

	/**
	 */
	constructor()
	{
		// Autofill values in document:
		for (const node of /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll("[data-autofill]")))
		{
			let text = node.innerText;
			for (const [match, key] of text.matchAll(/\{\{(\w+)\}\}/g))
			{
				text = text.replace(match, this.meta[key] || key);
			}
			node.innerText = text;
		}
		ui.wait();
		const specialrules = new OwcSpecialrulesDirectory();
		this.settings = new OwcSettings();
		this.localizer = new OwcLocalizer();
		Promise.all([
			pageSnippets.import(absoluteUrl("components/specialrulesSelector/component.xml")),
			this.#actionBar.bind(),
			this.localizer.import("editor"),
			specialrules.load()
		])
			.then(() =>
			{
				/** The currently edited waband. */
				this.warband = new Warband(specialrules); // Will be set by actual values from settings later.
				/** The mediator between the {@linkcode OwcLayout} user interface and the {@linkcode Warband} data. */
				this.editor = new OwcEditor(this.warband, this.localizer, this.settings);
			})
			.then(() => this.settings.load()) // Settings require an Editor, that's why they are loaded here.
			.then(() =>
			{
				const url = new URL(window.location.href);
				const warbandCode = url.searchParams.get("warband");
				const pid = url.searchParams.get("pid");
				console.log("pid:", pid, "warband:", warbandCode);
				try
				{
					if (pid)
					{
						this.pid = pid;
						/** @type {OwcLocalstorageData} */
						const sotrageData = JSON.parse(localStorage?.getItem("owc_#" + pid));
						this.warband.fromString(sotrageData.data);
					}
					else
					{
						if (warbandCode)
						{
							this.warband.fromString(warbandCode);
							url.searchParams.delete("warband");
							notifications.notify("The warband was imported from the URL.", "green");
						}
						else
						{
							this.warband.clear().addUnit();
						}
						this.newPid(url);
					}
				}
				catch (e) // No big deal if the warband could not be restored from localStorage. Maybe the PID didn't even exist.
				{
					console.info("Could not restore warband:", e);
					this.warband.clear().addUnit();
				}
			})
			.finally(() =>
			{
				// this.ui.waitEnd(); -- Waiting ends when the layout is ready.
				// In case that the settings were modified or a unit was copied in another tab, refresh this tab when the user returns here.
				document.addEventListener("visibilitychange", () =>
				{
					if (document.visibilityState === "visible")
					{
						this.settings.load();
					}
				});
			});
		return;
	}

	#actionBar = new class
	{
		/** @type {Menubox2Transitions} */
		#menuTransitions = { height: { closed: "0", opened: "auto" } };
		#menuCss = "top-menu";

		/**
		 * @param {OnlineWarbandCalculator} parent
		 */
		constructor(parent)
		{
			this.parent = parent;
		}
		bind ()
		{
			function isHTMLElement (obj)
			{
				return (obj instanceof HTMLElement);
			}
			const actions = {
				"file": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#fileMenu.toggle(evt, null, evt.currentTarget),
				"undo": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#undoMenu.toggle(evt, null, evt.currentTarget),
				"print": () => window.print(),
				"share": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#shareMenu.toggle(evt, null, evt.currentTarget),
				"language": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#languageMenu.toggle(evt, null, evt.currentTarget),
				"settings": (/** @type {PointerEvent} */evt) =>
				{
					evt.stopImmediatePropagation();
					Menubox2.closeAll();
					ui.wait();
					pageSnippets.import("./dialogs/settings/pagesnippet.xml")
						.then(() => settingsBluebox.show(this.parent.settings, this.parent.editor))
						.finally(() => ui.waitEnd());
				}
			};
			for (const [name, func] of Object.entries(actions))
			{
				const buttonBarIcon = document.body.querySelector(`#top-menu [data-action="${name}"]`);
				if (buttonBarIcon instanceof HTMLElement)
				{
					buttonBarIcon.addEventListener("click", func);
				}
			}
		}

		#fileMenu = new Menubox2("file", {
			items: [
				{
					key: "new", label: "Start a new warband", icon: "fa-regular fa-file",
					callback: () =>
					{
						this.parent.newPid();
						this.parent.warband.clear().addUnit();
						this.parent.editor.render();
					}
				},
				{
					key: "new-window", label: "New warband in a new window", icon: "fa-solid fa-up-right-from-square",
					callback: () => window.open(window.location.origin + window.location.pathname)
				},
				{
					key: "clone-to-new-window", label: "Clone this warband to a new window", icon: "fa-solid fa-clone",
					callback: () => window.open(this.parent.getShareUrl())
				},
				{ separator: true },
				{
					key: "upload", label: "Open a warband file", icon: "fa-regular fa-folder-open",
					callback: () => localFileIo.requestFile().then(code => this.parent.importWarband(code) || notifications.notify("This file does not contain a valid warband code.", "red"))
				},
				{
					key: "download", label: "Download this warband as file", icon: "fa-solid fa-download",
					callback: () => localFileIo.offerDownload(this.parent.getFileName(), this.parent.getWarbandCode())
				},
				{
					key: "show-code", label: "Import/export warband code", icon: "fa-solid fa-code",
					callback: () =>
					{
						ui.wait();
						pageSnippets.import("./dialogs/warbandcode/pagesnippet.xml")
							.then(() => warbandcodeBluebox.show(this.parent.getWarbandCode()))
							.finally(() => ui.waitEnd());
					}
				},
				{ separator: true },
				{
					key: "restore", label: "Restore a previous session", icon: "fa-solid fa-clock-rotate-left",
					callback: () =>
					{
						ui.wait();
						pageSnippets.import("./dialogs/restorer/pagesnippet.xml")
							.then(() => restorerBluebox.show())
							.finally(() => ui.waitEnd());
					}

				},
			],
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});

		#undoMenu = new Menubox2("undo", {
			items: [], // Items will be createy dynamically on before popup.
			itemRenderer: iconizedMenuitemRenderer,
			css: [this.#menuCss, "undohistory"].join(" "),
			transitions: this.#menuTransitions,
			beforePopup: (mbx) =>
			{
				const undo = (/** @type {UIEvent} */event) =>
				{
					mbx.close();
					if (event.currentTarget instanceof HTMLElement)
					{
						this.parent.editor.undo(Number(event.currentTarget.dataset.i));
					}
				};
				const menuItemsWrapper = mbx.element.querySelector(".menubox-items");
				if (this.parent.editor.snapshots.length === 0)
				{
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Nothing to undo", icon: "fa-solid fa-umbrella-beach" }));
				}
				else
				{
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Undo:", icon: "fa-solid fa-arrow-rotate-left" }));
					let currentWrapper = menuItemsWrapper;
					let i = 1;
					for (const snapshotItem of this.parent.editor.snapshots.slice(0, 10))
					{
						const innerWrapper = makeElement("div.wrapper",
							makeElement("div.menubox-item", { "data-i": i.toString(), onclick: (evt) => undo(evt) },
								makeElement("span.label", snapshotItem.label),
								makeElement("span.points", { "data-sign": Math.sign(snapshotItem.pointsModification).toString() }, snapshotItem.pointsModification)
							));
						currentWrapper.appendChild(innerWrapper);
						currentWrapper = innerWrapper;
						i += 1;
					}
				}
			}
		});

		/*
	if (typeof navigator.share === "function")
	{
		this.parent.topMenu.shareMenu.appendItem(
			{
				key: "browser",
				label: "More...",
				iconHtml: htmlBuilder.newElement("i.fas.fa-ellipsis-h")
			}
		);
	}
	*/
		#shareMenu = new Menubox2("share", {
			items: [
				{
					key: "create-link", label: "Create share link", icon: "fa-solid fa-link",
					callback: () =>
					{
						window.history.replaceState({}, "", new URL(this.parent.getShareUrl()));
						notifications.notify("Link created. You can now share this page.", "green");
					}
				},
				{
					key: "copy-to-clipboard", label: "Copy URL to clipboard", icon: "fa-solid fa-clipboard",
					callback: () =>
					{
						navigator.clipboard?.writeText?.(this.parent.getShareUrl())
							.then(() => notifications.notify("The link to share is copied to your clipboard.", "green"));
					}
				},
			],
			align: { horizontal: "right" },
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});

		#languageMenu = new Menubox2("language", {
			items: [
				{ key: "en", label: "English" },
				{ key: "de", label: "Deutsch" }
			],
			callback: (mit) => this.parent.settings.setProperty("editor.language", mit.key),
			align: { horizontal: "right" },
			itemRenderer: (def) =>
			{
				const menuItem = Menubox2.itemRenderer(def);
				menuItem.insertBefore(makeElement("span.lang-icon", def.key), menuItem.firstChild);
				return menuItem;
			},
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});
	}(this);

	get warbandStorageKey ()
	{
		return "owc_#" + this.pid;
	}

	/**
	 *
	 * @param {URL} [url]
	 */
	newPid (url = new URL(window.location.href))
	{
		this.pid = (Math.random() * 1e16).toString(32).substring(0, 8);
		url.searchParams.set("pid", this.pid);
		window.history.replaceState({}, "", url);
	}

	getFileName ()
	{
		return this.localizer.nonBlankWarbandName(this.warband.name) + ".owc.txt";
	}

	getWarbandCode ()
	{
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		return [
			"# " + this.localizer.nonBlankWarbandName(this.warband.name),
			"# " + document.getElementById("warband-summary").firstElementChild.textContent,
			"# " + `${year}-${month}-${day} ${hours}:${minutes}`,
			"# " + this.meta.origin,
			"",
			this.warband.toString(),
		].join("\n");
	}

	getShareUrl ()
	{
		return absoluteUrl("?warband=" + encodeURIComponent(this.warband.toString()));
	}

	/**
	 *
	 * @param {string} codeString
	 * @returns
	 */
	importWarband (codeString)
	{
		const warbandCode = codeString
			.split("\n")
			.filter(l => !l.trim().startsWith("#")) // Ignore all comment lines.
			.map(l => decodeURI(l.replaceAll(/\s/g, ""))) // Remove all whitespace.
			.join("");
		const warbandBackup = this.warband.toString();
		try
		{
			this.warband.fromString(warbandCode);
		}
		catch (err)
		{
			console.error(err.message);
			this.warband.fromString(warbandBackup);
			return false;
		}
		this.editor.render();
		window.scrollTo({ top: 0, behavior: "smooth" });
		this.editor.snapshots = [];
		this.editor.storeWarbandInBrowser();
		return true;
	}

	plainTextWarband ()
	{
		// const unitFormat = "{count} {name} {personalityFlag}\n{locale_points}: {points} | {locale_quality}: {quality}+ | {locale_combat}: {combat}\n{locale_specialrules}: {specialrules}\n------------------";
		const unitFormat = "{count}{name}\tQ {quality}+ | C {combat} | {points} Pt.\n{specialrules}\t{personalityFlag}\n\n";
		const result = [
			this.localizer.nonBlankWarbandName(this.warband.name),
			"",
			...this.warband.units.map(u => stringFill(unitFormat, {
				count: (u.count > 1) ? `${u.count}x ` : "",
				name: this.localizer.nonBlankUnitName(u.name),
				personalityFlag: (u.isPersonality) ? `[${this.localizer.translate("personality")}]` : "",
				points: u.points,
				quality: u.quality,
				combat: u.combat,
				specialrules: u.specialrules.map(s => this.localizer.translate(s.key).replace("...", s.additionalText)).join(", "),
				locale_points: this.localizer.translate("points"),
				locale_quality: this.localizer.translate("quality"),
				locale_combat: this.localizer.translate("combat"),
				locale_specialrules: this.localizer.translate("specialrules"),
			}))
		];
		return result.join("\n");
	}
};
