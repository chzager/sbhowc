// @ts-check
// TODO: Re-Implement "copy unit".
// TODO: Re-Implement "classic touch" layout.
// TODO: Implement "close" button in Blieboxes.
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
			for (const [key, value] of Object.entries(this.meta))
			{
				text = text.replace("{{" + key.toLowerCase() + "}}", value);
			}
			node.innerText = text;
		}
		this.ui = new OwcUI();
		this.ui.wait("Loading");
		const specialrules = new OwcSpecialrulesDirectory();
		this.settings = new OwcSettings();
		this.localizer = new OwcLocalizer();
		Promise.all([
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
							owc.ui.notify("The warband was imported from the URL.", "green");
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
				this.ui.waitEnd();
			});
		return;
	}

	#actionBar = new class
	{
		/** @type {Menubox2Transitions} */
		#menuTransitions = { height: { closed: "0", opened: "auto" } };
		#menuCss = "top-menu";

		bind ()
		{
			function isHTMLElement (a)
			{
				return (a instanceof HTMLElement);
			}
			const actions = {
				"file": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#fileMenu.toggle(evt, null, evt.currentTarget),
				"undo": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#undoMenu.toggle(evt, null, evt.currentTarget),
				"print": () => window.print(),
				"share": (/** @type {PointerEvent} */evt) => isHTMLElement(evt.currentTarget) && this.#shareMenu.toggle(evt, null, evt.currentTarget),
				"settings": (/** @type {PointerEvent} */evt) =>
				{
					evt.stopImmediatePropagation();
					Menubox2.closeAll();
					pageSnippets.import("./dialogs/settings/pagesnippet.xml")
						.then(() => settingsBluebox.show(owc.settings, owc.editor));
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
						owc.newPid();
						owc.warband.clear().addUnit();
						owc.editor.render();
					}
				},
				{
					key: "new-window", label: "New warband in a new window", icon: "fa-solid fa-up-right-from-square",
					callback: () => window.open(window.location.origin + window.location.pathname)
				},
				{
					key: "upload", label: "Open a warband file", icon: "fa-regular fa-folder-open",
					callback: () => localFileIo.requestFile().then(code => owc.importWarband(code))
				},
				{ separator: true },
				{
					key: "download", label: "Download this warband as file", icon: "fa-solid fa-download",
					callback: () => localFileIo.offerDownload(owc.getFileName(), owc.getWarbandCode())
				},
				{
					key: "show-code", label: "Import/export warband code", icon: "fa-solid fa-code",
					callback: () =>
					{
						pageSnippets.import("./dialogs/warbandcode/pagesnippet.xml")
							.then(() => warbandcodeBluebox.show(owc.getWarbandCode()));
					}
				},
			],
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});

		#undoMenu = new Menubox2("undo", {
			items: [], // Items will be createy dynamically on popup.
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
						owc.editor.undo(Number(event.currentTarget.dataset.i));
					}
				};
				const menuItemsWrapper = mbx.element.querySelector(".menubox-items");
				if (owc.editor.snapshots.length === 0)
				{
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Nothing to undo", icon: "fa-solid fa-umbrella-beach" }));
				}
				else
				{
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Undo:", icon: "fa-solid fa-clock-rotate-left" }));
					let currentWrapper = menuItemsWrapper;
					let i = 1;
					for (const snapshotItem of owc.editor.snapshots.slice(0, 10))
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

		#shareMenu = new Menubox2("share", {
			items: [
				{
					key: "create-link", label: "Create share link", icon: "fa-solid fa-link",
					callback: () =>
					{
						window.history.replaceState({}, "", new URL(owc.getShareUrl()));
						owc.ui.notify("Link created. You can now share this page.", "green");
					}
				},
				{
					key: "copy-to-clipboard", label: "Copy URL to clipboard", icon: "fa-solid fa-clipboard",
					callback: () =>
					{
						navigator.clipboard?.writeText?.(owc.getShareUrl())
							.then(() => owc.ui.notify("The link to share is copied to your clipboard.", "green"));
					}
				},
			],
			align: { horizontal: "right" },
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});
	};

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
		try
		{
			this.warband.fromString(warbandCode);
		}
		catch (err)
		{
			console.error(err.message);
			return false;
		}
		this.editor.render();
		window.scrollTo({ top: 0, behavior: "smooth" });
		this.editor.snapshots = [];
		this.editor.storeWarbandInBrowser();
		return true;
	}
};
