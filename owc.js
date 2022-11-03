/**
 * This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
 * Copyright 2021 Christoph Zager
 * Licensed unter the GNU Affero General Public License, Version 3
 * See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

/*
 * FILE STATE:
 * `owcCache` converted to IIFE and documented.
 * `owc` and `owcStats` convertert to object literals containing all functions and properties,
 * `helpers` still // TODO
 * // TODO: documentation
 */

let owc = {
	urlParam: {
		WARBAND: "warband",
		PRINT: "print",
		PID: "pid"
	},
	meta: {
		TITLE: "Online Warband Creator for Song of Blades and Heroes",
		VERSION: "Feb22 release",
		ORIGIN: "https://suppenhuhn79.github.io/sbhowc"
	},

	/**
	 * Set by `init()`
	 * @type {Boolean}
	 */
	isPrinting: null,
	/**
	 * @type {Warband}
	 */
	warband: null,

	init: function ()
	{
		/* autofill values in document */
		for (let node of document.querySelectorAll("[data-autofill]"))
		{
			let text = node.innerText;
			for (let key in owc.meta)
			{
				text = text.replace("{{" + key.toLowerCase() + "}}", owc.meta[key]);
			};
			node.innerText = text;
		};
		owc.isPrinting = (window.location.getParam(owc.urlParam.PRINT) === "1");
		/* generate PID */
		owc.pid = window.location.getParam(owc.urlParam.PID);
		if (owc.pid === "")
		{
			owc.pid = owc.generatrePid();
		};
		owc.warband = new Warband();
		owcSettings.load();
		owc.fetchResources();
		if (owc.isPrinting === false)
		{
			owcTopMenu.init();
			htmlBuilder.removeChildrenByQuerySelectors([".only-print"]);
			fileIo.fetchServerFile("./res/didyouknow.json").then((values) =>
			{
				owc.didYouKnow = new DidYouKnow(document.getElementById("didyouknow_text"), values.hints);
				owc.didYouKnow.printRandomHint();
			});
			pageSnippets.import("./snippets/warbandcode.xml").then(() => document.body.appendChild(pageSnippets.warbandcode.produce(warbandcode)));
			pageSnippets.import("./snippets/restorer.xml").then(() => document.body.appendChild(pageSnippets.restorer.main.produce(restorer)));
			pageSnippets.import("./snippets/settings.xml").then(() => document.body.appendChild(pageSnippets.settings.produce(settingsUi,
				{
					'combat-values': owcEditor.combatValues,
					'quality-values': owcEditor.qualityValues
				})));
			pageSnippets.import("./snippets/filesurfer.xml").then(() =>
			{
				document.body.appendChild(pageSnippets.filesurfer.main.produce(fileSurfer));
				fileSurfer.init();
				owcStats.componentsLoaded.set("filesurfer");
			});
		}
		else
		{
			htmlBuilder.removeChildrenByQuerySelectors([".noprint", ".tooltip"]);
		};
	},

	main: function ()
	{
		owc.ui.init();
		owcEditor.init();
		/* import warband from URL, restore from cache or create new */
		if (owc.importWarband(window.location.getParam(owc.urlParam.WARBAND), false, "Warband successfully imported.") === false)
		{
			if (owcCache.restore() === false)
			{
				owcEditor.newWarband();
			};
		};
		/* -- */
		history.replaceState({}, "", window.location.setParams({ [owc.urlParam.PID]: owc.pid }, ["print", "console"]));
		owcEditor.buildSpecialrulesCollection();
		owc.ui.visualizer.init();
		owc.ui.printWarband();
		owc.ui.waitEnd();
		if ((owc.isPrinting) && (typeof window.print === "function"))
		{
			window.print();
		}
		owcStats.actionsPerformed.set("main");
	},

	isPid: function (string)
	{
		return (/^(?=\D*\d)[\d\w]{6}$/.test(string));
	},

	generatrePid: function ()
	{
		let pid = [];
		for (let i = 0; i < 6; i += 1)
		{
			let c = Math.floor(Math.random() * 36);
			pid.push(String.fromCharCode((c < 10) ? c + 48 : c - 10 + 97));
		}
		/* make sure PID contains at least two numbers */
		while (/\d.*\d/.test(pid.join("")) === false)
		{
			pid[Math.floor(Math.random() * pid.length)] = String.fromCharCode(48 + Math.floor(Math.random() * 10));
		}
		let result = pid.join("");
		console.debug("generated new PID:", result);
		return result;
	},

	fetchResources: function ()
	{
		function _requireResource (key, lang)
		{
			requiredResoures.push("./res/" + lang + "/" + key + "." + lang + ".json");
		};
		owc.ui.wait("Loading resources");
		owcStats.componentsLoaded.set("resources", false);
		const REQUIRED_KEYS = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
		let requiredResoures = [];
		/* require all resources for default language */
		for (let resource of REQUIRED_KEYS)
		{
			_requireResource(resource, owcResources.DEFAULT_LANGUAGE);
		};
		/* eventually require some resources for set language */
		if (owcSettings.language !== owcResources.DEFAULT_LANGUAGE)
		{
			_requireResource("meta", owcSettings.language);
			for (let scopeKey of owcSettings.ruleScope)
			{
				_requireResource("specialrules-" + scopeKey, owcSettings.language);
			};
		};
		owcResources.import(requiredResoures).then(() => { owcStats.componentsLoaded.set("resources"); });
		/* load loayout */
		owc.ui.visualizer?.unload?.();
		let viewFullname = owcSettings.viewMode + "view";
		console.debug("Layout '" + owcSettings.viewMode + "' is loaded:", owcStats.componentsLoaded.is(viewFullname));
		if (owcStats.componentsLoaded.is(viewFullname) === false)
		{
			owcStats.componentsLoaded.set("layout", false);
			pageSnippets.import("./views/" + viewFullname + "/" + viewFullname + ".xml").then(
				() =>
				{
					owcStats.componentsLoaded.set(owcSettings.viewMode + "view");
				},
				(error) =>
				{
					console.error(error);
					owc.ui.waitEnd();
					owc.ui.warbandCanvas.appendChild(htmlBuilder.newElement("div.notification.red", "Error while loading layout \"" + owcSettings.viewMode + "\"."));
				}
			);
		}
		else
		{
			owcStats.componentsLoaded.set(viewFullname);
		}
	},

	importWarband: function (codeString, autoPrint = true, notification = null)
	{
		let result = false;
		if (codeString !== "")
		{
			/* clear comments */
			let warbandCode = "";
			for (let line of codeString.split("\n"))
			{
				if (line.trim().startsWith("#") === false)
				{
					warbandCode += decodeURI(line.replaceAll(/\s/g, ""));
				}
			}
			try
			{
				owc.warband.fromString(warbandCode, owcResources.data);
				owcCache.update();
				if (autoPrint)
				{
					owc.ui.printWarband();
				}
				if (notification)
				{
					owc.ui.notify(notification);
				}
				window.scrollTo({ top: 0, behavior: "smooth" });
				result = true;
			}
			catch (ex)
			{
				console.error(ex.message);
				owcCache.restore();
			}
		}
		return result;
	},

	getWarbandCode: function (includeComments = owcSettings.options.warbandcodeIncludesComments)
	{
		let result = "";
		if (includeComments)
		{
			let now = new Date();
			result += "# " + owc.helper.nonBlankWarbandName() + "\n";
			result += "# " + owc.helper.warbandSummary() + "\n";
			result += "# " + now.toIsoFormatText() + "\n";
			result += "# " + owc.meta.ORIGIN + "\n";
			result += "\n";
		};
		result += owc.warband.toString();
		return result;
	},

	performReminderActions: function ()
	{
		let reminder = localStorage.getItem("owc_reminder");
		if (!!reminder)
		{
			localStorage.removeItem("owc_reminder");
			reminder = JSON.parse(reminder);
			if ((reminder.action === "fileSurfer") && (!!owc.cloud[reminder.provider]))
			{
				fileSurfer.registerService(reminder.provider);
				fileSurfer.show();
			}
			else if (reminder.action === "notSignedIn")
			{
				owc.ui.notify("Your sign in attempt was not successful.", "yellow");
			}
			else if (reminder.action === "noPermission")
			{
				owc.cloud[reminder.provider].complainNoPermission();
			}
		}
		owcStats.actionsPerformed.set("reminder");
	},

	onComponentLoaded: function (componentKey)
	{
		if (owcStats.componentsLoaded.is("layout"))
		{
			owc.ui.visualizer = window[owcSettings.viewMode + "view"];
		}
		if (owcStats.componentsLoaded.is("resources", "layout") && owcStats.actionsPerformed.isNot("main"))
		{
			owc.main();
		}
		if (owcStats.componentsLoaded.is("resources", "layout", "filesurfer") && owcStats.actionsPerformed.isNot("reminder"))
		{
			owc.performReminderActions();
		}
		if (owcStats.componentsLoaded.is("filesurfer", "fileio"))
		{
			fileSurfer.init();
			/*
			let cloudService = localStorage.getItem("fileSurfer");
			if ((!!cloudService) && (typeof owc.cloud[cloudService].registerToFilerSurfer === "function"))
			{
				owc.cloud[cloudService].registerToFilerSurfer();
			}
			*/
		}
		if (/\w+view$/.test(componentKey))
		{
			owcStats.componentsLoaded.set("layout");
		}
	}
};

let owcStats = new function ()
{

	this.componentsLoaded = new function ()
	{

		/**
		 * @type {Map<String, Date?>}
		 */
		let keys = new Map();

		this.is = function (...keys)
		{
			let result = true;
			for (let key of keys)
			{
				result &&= (keys.get(key) instanceof Date);
			}
			return result;
		};

		this.set = function (key, isLoaded = true)
		{
			keys.set(key, (isLoaded === true) ? new Date() : null);
			console.debug("Component '" + key + "' " + ((isLoaded) ? "is ready." : "was unloaded."));
			owc.onComponentLoaded(key);
		};
	};

	this.actionsPerformed = new function ()
	{

		/**
		 * @type {Map<String, Date?>}
		 */
		let keys = new Map();

		this.is = function (key)
		{
			return (keys.get(key) instanceof Date);
		};

		this.isNot = function (key)
		{
			return !this.is(key);
		};

		this.set = function (key, isPerformed = true)
		{
			return keys.set(key, (isPerformed === true) ? new Date() : null);
		};
	};
};

/* helper functions */
owc.helper = {
	nonBlankUnitName: (unit) => (unit.name.trim() !== "") ? unit.name : owc.helper.translate("defaultUnitName"),
	nonBlankWarbandName: () => (owc.warband.name.trim() !== "") ? owc.warband.name : owc.helper.translate("defaultWarbandName"),
	warbandSummary: () => document.getElementById("warbandfooter").querySelector("p").innerText,
	translate: (key, variables) => owcResources.translate(key, owcSettings.language, variables)
};

/**
 * Caching warbands in the browsers `localStorage` to prevent data loss on page refresh or exiting the
 * browser session.
 */
let owcCache = new function ()
{
	const KEY_PREFIX = "owc_#";

	/**
	 * Stores the current warband in `localStorage`.
	 */
	this.update = async function ()
	{
		/* do not store an empty warband (#17) */
		if (owc.warband.isEmpty === false)
		{
			let data = {
				title: owc.helper.nonBlankWarbandName(),
				// TODO: figure-count and points will be dropped in future versions
				'figure-count': owc.warband.figureCount,
				points: owc.warband.points,
				data: owc.warband.toString(),
				date: (new Date()).toISOString()
			};
			localStorage.setItem(KEY_PREFIX + owc.pid, JSON.stringify(data));
		}
	};

	/**
	 * Tries to read the item wit the current PID from `localStorage` and to load it as a warband.
	 * @returns {boolean} `true` if a warband was successfully restored from localStorage, otherwise `false`.
	 */
	this.restore = function ()
	{
		let result = false;
		let storedData = JSON.parse(localStorage.getItem(KEY_PREFIX + owc.pid) ?? localStorage.getItem(owc.pid)); // DEPRECATED: remove restoring `owc.pid` items (w/o prefix)
		if (typeof storedData?.data === "string")
		{
			owc.warband.fromString(storedData.data, owcResources.data);
			result = true;
		}
		return result;
	};

	/**
	 * Cleans up legacy items from local storage.
	 * // TODO: implement
	 */
	this.cleanup = async function ()
	{
		/* every 14 days we will discard the oldest cache entries to keep at most 100 enties */
		console.error("Not implemented yet.");
	};
};
