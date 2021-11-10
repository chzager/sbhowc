"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let owc =
{
	urlParam:
	{
		WARBAND: "warband",
		PRINT: "print",
		PID: "pid"
	},
	meta:
	{
		TITLE: "Online Warband Creator for Song of Blades and Heroes",
		VERSION: "Aug21 release",
		ORIGIN: "https://suppenhuhn79.github.io/sbhowc"
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
	owc.editor.init();
	owc.ui.init();
	/* fetchResources() runs asynchronously; when finished, it calls owc.main() */
	owc.fetchResources();
	/* load additional parts, asynchronously */
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
	}
	else
	{
		htmlBuilder.removeChildrenByQuerySelectors([".noprint", ".tooltip"]);
	};
};

owc.main = function ()
{
	/* import warband from URL, restore from cache or create new */
	if (owc.importWarband(window.location.getParam(owc.urlParam.WARBAND), false) === false)
	{
		if (owc.cache.restore() === false)
		{
			owc.editor.newWarband();
		};
	};
	history.replaceState({}, "", window.location.setParams({[owc.urlParam.PID]: owc.pid}, ["print", "console"]));		
	owc.editor.buildSpecialrulesCollection();
	owc.ui.initView();
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
	let requiredResoures = [];
	let requiredKeys = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
	/* require all resources for default language */
	for (let resource of requiredKeys)
	{
		_requireResource(resource, owc.resources.DEFAULT_LANGUAGE);
	};
	/* eventually require some resources for set language */
	if (owc.settings.language !== owc.resources.DEFAULT_LANGUAGE)
	{
		_requireResource("meta", owc.settings.language);
		for (let translatedRules of owc.settings.ruleScope)
		{
			_requireResource("specialrules-" + translatedRules, owc.settings.language);
		};
	};
	owc.resources.import(requiredResoures).then(owc.main);
};

owc.importWarband = function (codeString, autoPrint = true)
{
	let result = false;
	if (codeString !== "")
	{
		/* clear comments */
		let lines = codeString.split("\n");
		let warbandCode = "";
		for (let line of lines)
		{
			if (line.trim().startsWith("#") === false)
			{
				warbandCode += decodeURI(line.replaceAll(/\s/g, ""));
			};
		};
		try
		{
			owc.warband.fromString(warbandCode, owc.resources.data);
			owc.cache.update();
			result = true;
		}
		catch (ex)
		{
			console.error(ex.message);
			owc.cache.restore();
		};
		if (autoPrint)
		{
			owc.ui.printWarband();
		};
	};
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

/* helper functions */
owc.helper = {
	nonBlankUnitName: (unit) => (unit.name.trim() !== "") ? unit.name : owc.helper.translate("defaultUnitName"),
	nonBlankWarbandName: () => (owc.warband.name.trim() !== "") ? owc.warband.name : owc.helper.translate("defaultWarbandName"),
	warbandSummary: () => document.getElementById("warbandfooter").querySelector("p").innerText,
	translate: (key, variables) => owc.resources.translate(key, owc.settings.language, variables)
};

/* cache */
owc.cache = {
	update: () =>
	{
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
			localStorage.setItem(owc.pid, JSON.stringify(data));
		}
	},
	restore: () =>
	{
		let result = false;
		let storedData = JSON.parse(localStorage.getItem(owc.pid));
		if (typeof storedData?.data === "string")
		{
			owc.cache.fields = storedData;
			owc.warband.fromString(storedData.data, owc.resources.data);
			result = true;
		}
		return result;
	},
	cleanup: async () =>
	{
		/* every 14 days we will discard the oldest cache entries to keep at mont 100 enties */
		console.error("Not implemented yet.");
	}
};
