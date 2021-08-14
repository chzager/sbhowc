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
		VERSION: "Aug21 preview (5)",
		ORIGIN: "https://suppenhuhn79.github.io/sbhowc"
	},
	warband: null
};

owc.init = function ()
{
	console.debug("owc.init()");
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
	/* prepare document regarding its status */
	if (owc.ui.isPrinting === false)
	{
		owc.topMenu.init();
		htmlBuilder.removeChildrenByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeChildrenByQuerySelectors([".noprint", ".tooltip"]);
	};
	owc.warband = new Warband();
	owc.storage.init();
	owc.settings.load();
	owc.editor.init();
	owc.ui.init();
	/* fetchResources() runs asynchronously; when finished, it calls owc.main() */
	owc.fetchResources();
	/* load additional parts, asynchronously */
	if (owc.ui.isPrinting === false)
	{
		fileIo.fetchServerFile("./res/didyouknow.json").then((values) =>
		{
			owc.didYouKnow = new DidYouKnow(document.getElementById("didyouknow_text"), values.hints);
			owc.didYouKnow.printRandomHint();
		}
		);
		pageSnippets.import("./snippets/warbandcode.xml").then(() => document.body.appendChild(pageSnippets.warbandcode.produce(warbandcode)));
		pageSnippets.import("./snippets/restorer.xml").then(() => document.body.appendChild(pageSnippets.restorer.main.produce(restorer)));
		pageSnippets.import("./snippets/settings.xml").then(() => document.body.appendChild(pageSnippets.settings.produce(settingsUi,
				{
					'combat-values': owc.editor.combatValues,
					'quality-values': owc.editor.qualityValues
				}
				)));
	};
};

owc.main = function ()
{
	console.debug("owc.main()");
	/* getting PID (https://github.com/Suppenhuhn79/sbhowc/issues/13#issuecomment-774077538) */
	let pid = window.location.getParam(owc.urlParam.PID);
	if (pid === "")
	{
		if (owc.isPid(window.name))
		{
			console.debug("getting PID from window.name:", window.name);
			pid = window.name;
		}
		else
		{
			pid = owc.newPid();
		};
	};
	let warbandCodeUrl = window.location.getParam(owc.urlParam.WARBAND);
	if (warbandCodeUrl !== "")
	{
		console.debug("importing warband from url");
		owc.importWarband(warbandCodeUrl, false);
	}
	else
	{
		/* trying to restore warband from localStorage */
		if (owc.storage.restoreWarband(pid) === false)
		{
			owc.editor.newWarband();
			owc.setPid(pid);
		};
	};
	console.debug("finally PID is", owc.pid);
	/* continue initialization */
	owc.editor.buildSpecialrulesCollection();
	owc.ui.initView();
	/* We won't waitEnd() here, because there is an async process running: rendering in initView() */
};

owc.setPid = function (pid)
{
	if (owc.pid !== pid)
	{
		owc.pid = pid;
		history.replaceState({}, "", window.location.setParams(
			{
				[owc.urlParam.PID]: owc.pid
			}, ["print", "console"]));
		/* storing PID into window.name so it' preserved on page refresh */
		window.name = owc.pid;
		console.debug("PID set to", owc.pid);
	};
};

owc.isPid = (string) => (/^(?=\D*\d)[\d\w]{6}$/.test(string));

owc.newPid = function ()
{
	let pid = [];
	for (let i = 0; i < 6; i += 1)
	{
		let c = Math.floor(Math.random() * 36);
		pid.push(String.fromCharCode((c < 10) ? c + 48 : c - 10 + 97));
	};
	/* make sure PID contains at least two numbers */
	while (/\d.*\d/.test(pid.join("")) === false)
	{
		pid[Math.floor(Math.random() * pid.length)] = String.fromCharCode(48 + Math.floor(Math.random() * 10));
	};
	let result = pid.join("");
	console.debug("generated new PID:", result);
	return result;
};

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
	let importingHash = owc.storage.hash(warbandCode);
	console.debug("owc.importWarband", warbandCode, importingHash);
	let found = false;
	for (let key in localStorage)
	{
		if (owc.isPid(key))
		{
			if (JSON.parse(localStorage[key]).hash === importingHash)
			{
				console.debug("found warband stored at pid", key);
				owc.storage.restoreWarband(key);
				found = true;
				break;
			}
		};
	};
	if (found === false)
	{
		owc.setPid(owc.newPid());
		console.debug("not found in localStorage");
		owc.warband.fromString(warbandCode, owc.resources.data);
		owc.storage.storeWarband();
		owc.ui.notify("New warband imported.");
	};
	if (autoPrint)
	{
		owc.ui.printWarband();
	};
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
owc.helper = {};
owc.helper.nonBlankUnitName = (unit) => (unit.name.trim() !== "") ? unit.name : owc.helper.translate("defaultUnitName");
owc.helper.nonBlankWarbandName = () => (owc.warband.name.trim() !== "") ? owc.warband.name : owc.helper.translate("defaultWarbandName");
owc.helper.warbandSummary = () => document.getElementById("warbandfooter").querySelector("p").innerText;
owc.helper.translate = (key, variables) => owc.resources.translate(key, owc.settings.language, variables);
