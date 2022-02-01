/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

const owc =
{
	urlParam: {
		WARBAND: "warband",
		PRINT: "print",
		PID: "pid"
	},
	meta: {
		TITLE: "Online Warband Creator for Song of Blades and Heroes",
		VERSION: "Aug21 release",
		ORIGIN: "https://suppenhuhn79.github.io/sbhowc"
	},
	stats: {
		componentsLoaded: {
			is: (...keys) => {
				let result = true;
				for (let key of keys)
				{
					result &&= (!!owc.stats.componentsLoaded[key]);
				}
				return result;
			},
			set: (key, isLoaded = true) => {
				owc.stats.componentsLoaded[key] = (isLoaded === true) ? new Date() : null;
				console.debug("Component '" + key + "' " + ((isLoaded) ? "is ready." : "was unloaded."));
				owc.onComponentLoaded(key);
			}
		},
		actionsPerformed: {
			is: (key) => (!!owc.stats.actionsPerformed[key]),
			isNot: (key) => !owc.stats.actionsPerformed.is(key),
			set: (key, isPerformed = true) => owc.stats.actionsPerformed[key] = (isPerformed === true) ? new Date() : false,
		}
	},
	warband: null
};

owc.init = function ()
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
	owc.settings.load();
	owc.fetchResources();
	if (owc.isPrinting === false)
	{
		owc.topMenu.init();
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
				'combat-values': owc.editor.combatValues,
				'quality-values': owc.editor.qualityValues
			})));
		pageSnippets.import("./snippets/filesurfer.xml").then(() =>
			{
				document.body.appendChild(pageSnippets.filesurfer.main.produce(fileSurfer));
				fileSurfer.init();
				owc.stats.componentsLoaded.set("filesurfer");
			});
	}
	else
	{
		htmlBuilder.removeChildrenByQuerySelectors([".noprint", ".tooltip"]);
	};
};

owc.main = function ()
{
	owc.ui.init();
	owc.editor.init();
	/* import warband from URL, restore from cache or create new */
	if (owc.importWarband(window.location.getParam(owc.urlParam.WARBAND), false, "Warband successfully imported.") === false)
	{
		if (owc.cache.restore() === false)
		{
			owc.editor.newWarband();
		};
	};
	/* -- */
	history.replaceState({}, "", window.location.setParams({[owc.urlParam.PID]: owc.pid}, ["print", "console"]));
	owc.editor.buildSpecialrulesCollection();
	owc.ui.visualizer.init();
	owc.ui.printWarband();
	owc.ui.waitEnd();
	if ((owc.isPrinting) && (typeof window.print === "function"))
	{
		window.print();
	}
	owc.stats.actionsPerformed.set("main");
};

owc.isPid = (string) => (/^(?=\D*\d)[\d\w]{6}$/.test(string));

owc.generatrePid = function()
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
}

owc.fetchResources = function ()
{
	function _requireResource(key, lang)
	{
		requiredResoures.push("./res/" + lang + "/" + key + "." + lang + ".json");
	};
	owc.ui.wait("Loading resources");
	owc.stats.componentsLoaded.set("resources", false);
	const REQUIRED_KEYS = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
	let requiredResoures = [];
	/* require all resources for default language */
	for (let resource of REQUIRED_KEYS)
	{
		_requireResource(resource, owc.resources.DEFAULT_LANGUAGE);
	};
	/* eventually require some resources for set language */
	if (owc.settings.language !== owc.resources.DEFAULT_LANGUAGE)
	{
		_requireResource("meta", owc.settings.language);
		for (let scopeKey of owc.settings.ruleScope)
		{
			_requireResource("specialrules-" + scopeKey, owc.settings.language);
		};
	};
	owc.resources.import(requiredResoures).then(() => { owc.stats.componentsLoaded.set("resources"); });
	/* load loayout */
	owc.ui.visualizer?.unload?.();
	let viewFullname = owc.settings.viewMode + "view";
	console.debug("Layout '" + owc.settings.viewMode + "' is loaded:", owc.stats.componentsLoaded.is(viewFullname));
	if (owc.stats.componentsLoaded.is(viewFullname) === false)
	{
		owc.stats.componentsLoaded.set("layout", false);
		pageSnippets.import("./views/" + viewFullname + "/" + viewFullname + ".xml").then(
			() =>
			{
				owc.stats.componentsLoaded.set(owc.settings.viewMode + "view");
			},
			(error) =>
			{
				console.error(error);
				owc.ui.waitEnd();
				owc.ui.warbandCanvas.appendChild(htmlBuilder.newElement("div.notification.red", "Error while loading layout \"" + owc.settings.viewMode + "\"."));
			}
		);
	}
	else
	{
		owc.stats.componentsLoaded.set(viewFullname);
	}
};

owc.importWarband = function (codeString, autoPrint = true, notification = null)
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
			owc.warband.fromString(warbandCode, owc.resources.data);
			owc.cache.update();
			if (autoPrint)
			{
				owc.ui.printWarband();
			}
			if (notification)
			{
				owc.ui.notify(notification);
			}
			window.scrollTo({top:0,behavior: "smooth"});
			result = true;
		}
		catch (ex)
		{
			console.error(ex.message);
			owc.cache.restore();
		}
	}
	return result;
};

owc.getWarbandCode = function (includeComments = owc.settings.options.warbandcodeIncludesComments)
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
};

owc.performReminderActions = function ()
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
	owc.stats.actionsPerformed.set("reminder");
};

owc.onComponentLoaded = function (componentKey)
{
	if (owc.stats.componentsLoaded.is("layout"))
	{
		owc.ui.visualizer = window[owc.settings.viewMode + "view"];
	}
	if (owc.stats.componentsLoaded.is("resources", "layout") && owc.stats.actionsPerformed.isNot("main"))
	{
		owc.main();
	}
	if (owc.stats.componentsLoaded.is("resources", "layout", "filesurfer") && owc.stats.actionsPerformed.isNot("reminder"))
	{
		owc.performReminderActions();
	}
	if (owc.stats.componentsLoaded.is("filesurfer", "fileio"))
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
		owc.stats.componentsLoaded.set("layout");
	}
};

/* helper functions */
owc.helper = {
	nonBlankUnitName: (unit) => (unit.name.trim() !== "") ? unit.name : owc.helper.translate("defaultUnitName"),
	nonBlankWarbandName: () => (owc.warband.name.trim() !== "") ? owc.warband.name : owc.helper.translate("defaultWarbandName"),
	warbandSummary: () => document.getElementById("warbandfooter").querySelector("p").innerText,
	translate: (key, variables) => owc.resources.translate(key, owc.settings.language, variables)
};

/* cache */
owc.cache = {
	update: () => {
		/* do not store an empty warband (#17) */
		if (owc.warband.isEmpty === false)
		{
			let data =
			{
				title: owc.helper.nonBlankWarbandName(),
				'figure-count': owc.warband.figureCount, // will be dropped in future versions
				points: owc.warband.points, // will be dropped in future versions
				data: owc.warband.toString(),
				date: (new Date()).toISOString()
			};
			localStorage.setItem("owc_#" + owc.pid, JSON.stringify(data));
		}
	},
	restore: () => {
		let result = false;
		let storedData = JSON.parse(localStorage.getItem("owc_#" + owc.pid) ?? localStorage.getItem(owc.pid));
		if (typeof storedData?.data === "string")
		{
			owc.cache.fields = storedData;
			owc.warband.fromString(storedData.data, owc.resources.data);
			result = true;
		}
		return result;
	},
	cleanup: async () => {
		/* every 14 days we will discard the oldest cache entries to keep at mont 100 enties */
		console.error("Not implemented yet.");
	}
};
