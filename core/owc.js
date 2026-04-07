/**
 * A warband calculator for the "Song of Blades and Heroes" fantasy tabletop skirmish rules.
 * @copyright (c) 2025 Christoph Zager
 * @license AGPL-3.0 https://www.gnu.org/licenses/agpl-3.0.en.html
 * @link https://github.com/chzager/sbhowc
 */
const owc = new class OnlineWarbandCalculator
{
	/**
	 * @returns The project's metadata.
	 */
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
		/** Editor, display and other settings. */
		this.settings = new OwcSettings();
		/** Provider of localization functionality. */
		this.localizer = new OwcLocalizer();
		Promise.all([
			pageSnippets.import("./ui/components/specialrulesSelector/component.xml"),
			this.#toolBar.bind(),
			this.localizer.import("editor"),
			specialrules.load(),
		])
			.then(() =>
			{
				/** The currently edited warband. */
				this.warband = new Warband(specialrules);
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
						const storageData = JSON.parse(localStorage?.getItem("owc_#" + pid));
						this.warband.fromString(storageData.data);
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
				catch (cause)
				{ // No big deal if the warband could not be restored from localStorage. Maybe the PID didn't even exist.
					console.info("Could not restore warband:", cause);
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

	/**
	 * The editor's toolbar.
	 */
	#toolBar = new class
	{
		/** Transitions for the Menuboxes in the action bar. @type {Menubox2Transitions} */
		#menuTransitions = { height: { closed: "0", opened: "auto" } };
		/** Mandatory CSS class for all Menuboxes in the action bar. */
		#menuCss = "top-menu";

		/**
		 * @param {OnlineWarbandCalculator} parent The OWC instance.
		 */
		constructor(parent)
		{
			this.parent = parent;
		}

		/**
		 * Binds event handler to the icons in the action bar.
		 */
		bind ()
		{
			/** @type {Object<string,ElementEventHandler<HTMLElement,PointerEvent>>} */
			const actions = {
				"file": (evt) => this.#fileMenu.toggle(evt, null, evt.currentTarget),
				"undo": (evt) => this.#undoMenu.toggle(evt, null, evt.currentTarget),
				"print": () => window.print(),
				"share": (evt) => this.#shareMenu.toggle(evt, null, evt.currentTarget),
				"language": (evt) => this.#languageMenu.toggle(evt, null, evt.currentTarget),
				"settings": async (evt) =>
				{
					evt.stopImmediatePropagation();
					SpecialrulesSelector.activeInstance?.close();
					Menubox2.closeAll();
					ui.wait();
					try
					{
						await pageSnippets.import("./ui/dialogs/settings/pagesnippet.xml");
						settingsBluebox.show(this.parent.settings, this.parent.editor);
					}
					finally
					{
						ui.waitEnd();
					}
				}
			};
			for (const [name, func] of Object.entries(actions))
			{
				const buttonBarIcon = document.body.querySelector(`#top-menu [data-action="${name}"]`);
				if (buttonBarIcon instanceof HTMLElement)
				{
					// @ts-expect-error: No overload matches this call. -> `func` is of type `ElementEventHandler` which extends the required function specification.
					buttonBarIcon.addEventListener("click", func);
				}
			}
		}

		/**
		 * Encodes specified characters in a string using their Unicode code points in hexadecimal format.
		 * This is used for URL-safe encoding of special characters in sharing links.
		 * @param {string} text The input string to encode.
		 * @param {string} chars A string containing the characters to encode (e.g., "*%" to encode asterisks and percent signs).
		 * @returns {string} The encoded string with specified characters replaced by %XX format.
		 */
		#unicodify (text, chars)
		{
			for (const c of chars)
			{
				text = text.replaceAll(c, "%" + c.charCodeAt(0).toString(16));
			};
			return text;
		};

		/** Menubox of the "file" tool. */
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
					callback: () =>
					{
						const newUrl = new URL(window.location.origin + window.location.pathname);
						this.parent.newPid(newUrl);
						window.open(newUrl);
					}
				},
				{
					key: "clone-to-new-window", label: "Clone this warband to a new window", icon: "fa-solid fa-clone",
					callback: () => window.open(this.parent.getShareUrl())
				},
				{ separator: true },
				{
					key: "upload", label: "Open a warband file", icon: "fa-regular fa-folder-open",
					callback: async () =>
					{
						const code = await localFileIo.requestFile();
						if (this.parent.importWarband(code))
						{
							notifications.notify("The warband was successfully loaded from the file.", "green");
						}
						else
						{
							notifications.notify("This file does not contain a valid warband code.", "red");
						}
					}
				},
				{
					key: "download", label: "Download this warband as file", icon: "fa-solid fa-download",
					callback: () => localFileIo.offerDownload(this.parent.getFileName(), this.parent.getWarbandCode())
				},
				{
					key: "show-code", label: "Import/export warband code", icon: "fa-solid fa-code",
					callback: async () =>
					{
						ui.wait();
						await pageSnippets.import("./ui/dialogs/warbandcode/pagesnippet.xml");
						warbandcodeBluebox.show(this.parent.getWarbandCode());
						ui.waitEnd();
					}
				},
				{ separator: true },
				{
					key: "restore", label: "Restore a previous session", icon: "fa-solid fa-clock-rotate-left",
					callback: async () =>
					{
						ui.wait();
						await pageSnippets.import("./ui/dialogs/restorer/pagesnippet.xml");
						restorerBluebox.show();
						ui.waitEnd();
					}
				},
			],
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});

		/** Menubox of the "undo" tool. */
		#undoMenu = new Menubox2("undo", {
			items: [], // Items are created dynamically when the menu is about to open.
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
			beforePopup: (mbx) =>
			{
				const menuItemsWrapper = /** @type {HTMLElement} */(mbx.element.querySelector(".menubox-items"));
				if (this.parent.editor.snapshots.length === 0)
				{
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Nothing to undo", icon: "fa-solid fa-umbrella-beach" }));
				}
				else
				{
					const undo = (/** @type {UIEvent} */event) =>
					{
						mbx.close();
						if (event.currentTarget instanceof HTMLElement)
						{
							this.parent.editor.undo(Number(event.currentTarget.dataset.i));
						}
					};
					menuItemsWrapper.replaceChildren(iconizedMenuitemRenderer({ label: "Undo:", icon: "fa-solid fa-arrow-rotate-left" }));
					let currentWrapper = menuItemsWrapper;
					let i = 1;
					for (const snapshotItem of this.parent.editor.snapshots.slice(0, 10))
					{
						const innerWrapper = makeElement("div.wrapper",
							makeElement("div.menubox-item", { "data-i": i.toString(), onclick: (evt) => undo(evt) },
								makeElement("span.label", snapshotItem.label),
								makeElement("span", { "data-points": snapshotItem.pointsModification, "data-sign": Math.sign(snapshotItem.pointsModification).toString() }, snapshotItem.pointsModification)
							));
						currentWrapper.appendChild(innerWrapper);
						currentWrapper = innerWrapper;
						i += 1;
					}
				}
			}
		});

		/** Menubox of the "share" tool. */
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
					callback: async () =>
					{
						await navigator.clipboard?.writeText?.(this.parent.getShareUrl());
						notifications.notify("The link to share was copied to your clipboard.", "green");
					}
				},
				{ separator: true },
				{
					key: "email", label: "E-Mail", icon: "fa-solid fa-envelope",
					callback: () =>
					{
						const body = this.parent.plainTextWarband() + "\n\n" + this.parent.getShareUrl();
						window.open("mailto:?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(body));
					}
				},
				{
					key: "whatsapp", label: "WhatsApp", icon: "fa-brands fa-whatsapp",
					callback: () =>
					{
						window.open("whatsapp://send?text=*" + this.#unicodify(document.title, "*") + "*%0d%0a" + this.#unicodify(this.parent.getShareUrl(), "%+"));
					}
				},
			].concat((() => // IIFE
				(typeof navigator.share === "function")
					? [
						{ separator: true },
						{
							key: "browser-native-share", label: "More...", icon: "i.fa-solid fa-ellipsis-h",
							callback: () => navigator.share(
								{
									title: document.title,
									text: document.title,
									url: this.parent.getShareUrl(),
								})
						},
					]
					: []
			)()),
			align: { horizontal: "right" },
			itemRenderer: iconizedMenuitemRenderer,
			css: this.#menuCss,
			transitions: this.#menuTransitions,
		});

		/** Menubox for selecting the editor language. */
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
				menuItem.insertBefore(makeElement("span.lang-icon", def.key ?? "??"), menuItem.firstChild);
				return menuItem;
			},
			css: this.#menuCss,
			transitions: this.#menuTransitions,
			beforePopup: (self) =>
			{
				for (const item of self.items)
				{
					(this.parent.settings.language === item.key) ? item.element.classList.add("checked") : item.element.classList.remove("checked");
				}
			}
		});
	}(this);

	/**
	 * @returns The key for the `localStorage` entry of the current project.
	 */
	get warbandStorageKey ()
	{
		return "owc_#" + this.pid;
	}

	/**
	 * Generates a new project ID and updates the "pid" query parameter in the given URL.
	 * @param {URL} [url] URL in which to update the "pid" query parameter. Defaults to the window location.
	 */
	newPid (url = new URL(window.location.href))
	{
		this.pid = (Math.random() * 1e16).toString(32).substring(0, 8);
		url.searchParams.set("pid", this.pid);
		window.history.replaceState({}, "", url);
	}

	/**
	 * Provides a name for a file to store the warband.
	 */
	getFileName ()
	{
		return this.localizer.nonBlankWarbandName(this.warband.name) + ".owc.txt";
	}

	/**
	 * Provides the warband's code including human-readable comments like name, points and date.
	 */
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

	/**
	 * Provides an URL to share the current warband. This URL contains a "warband" query parameter with  warband's code instead of the "pid".
	 */
	getShareUrl ()
	{
		return this.meta.origin + "/?warband=" + encodeURIComponent(this.warband.toString());
	}

	/**
	 * Imports a warband from a string. If successful, this replaces the current warband and clears the undo history.
	 * @param {string} codeString String to be imported as a warband.
	 * @returns `true` if the string succeeded to be imported as a warband, otherwise `false`.
	 */
	importWarband (codeString)
	{
		const warbandBackup = this.warband.toString();
		try
		{
			const warbandCode = codeString
				.split("\n")
				.filter(l => !l.trim().startsWith("#")) // Ignore all comment lines.
				.map(l => decodeURI(l.replaceAll(/\s/g, ""))) // Remove all whitespace.
				.join("");
			this.warband.fromString(warbandCode);
		}
		catch (cause)
		{ // If importing a warband from that stings failed, restore the previous one.
			console.error(cause);
			this.warband.fromString(warbandBackup);
			return false;
		}
		this.editor.render();
		window.scrollTo({ top: 0, behavior: "smooth" });
		this.editor.snapshots = [];
		this.editor.storeWarbandInBrowser();
		return true;
	}

	/**
	 * Provides the warband as human-readable plain text with units and points pools.
	 * The text is formatted according to the predefined unit format template.
	 */
	plainTextWarband ()
	{
		const unitFormat = "{count} {name} {personalityFlag}\n{locale_points}: {points} | {locale_quality}: {quality}+ | {locale_combat}: {combat}\n{locale_specialrules}: {specialrules}";
		const warbandName = this.localizer.nonBlankWarbandName(this.warband.name);
		return [
			warbandName + "\n" + "=".repeat(warbandName.length),
			...this.warband.units.map(u => stringFill(unitFormat, {
				count: (u.count > 1) ? `${u.count}x` : "",
				name: this.localizer.nonBlankUnitName(u.name),
				personalityFlag: (u.isPersonality) ? `[${this.localizer.translate("personality")}]` : "",
				points: u.points,
				quality: u.quality,
				combat: u.combat,
				specialrules: (u.specialrules.length > 0) ? u.specialrules.map(s => this.localizer.translate(s.key).replace("...", s.additionalText)).join(", ") : "--",
				locale_points: this.localizer.translate("points"),
				locale_quality: this.localizer.translate("quality"),
				locale_combat: this.localizer.translate("combat"),
				locale_specialrules: this.localizer.translate("specialrules"),
			})),
			...Array.from(this.warband.pointsPools.entries()).map(([k, v]) => `${this.localizer.translate(k + "PointsPool")}: ${v} ${this.localizer.translate("points")}`),
			document.querySelector("#totals").textContent,
		]
			.join("\n\n")
			.replace(/^\x20+|\x20+$/gm, "");
	}
};
