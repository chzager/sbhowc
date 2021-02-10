"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let owc = {};

owc.urlParam =
{
	"warband": "warband",
	"print": "print",
	"pid": "pid"
};

owc.meta =
{
	"title": "Online Warband Creator for Song of Blades and Heroes",
	"version": "Feb21 draft",
	"origin": "https://suppenhuhn79.github.io/sbhowc"
};

owc.warband = null;

owc.init = function ()
{
	console.debug("owc.init()");
	/* autofill values in document */
	for (let node of document.querySelectorAll("[data-autofill]"))
	{
		let text = node.innerText;
		for (let key in owc.meta)
		{
			text = text.replace("{{" + key + "}}", owc.meta[key]);
		};
		node.innerText = text;
	};
	/* prepare document regarding its status */
	if (owc.ui.isPrinting === false)
	{
		owc.topMenu.init();
		htmlBuilder.removeNodesByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
	owc.settings.load();
	owc.editor.init();
	/* fetchResources() runs asynchronously; when finished, it calls owc.main() */
	owc.fetchResources();
};

owc.main = function ()
{
	console.debug("owc.main()");
	owc.warband = new Warband();
	/* getting PID (https://github.com/Suppenhuhn79/sbhowc/issues/13#issuecomment-774077538) */
	owc.pid = window.location.getParam(owc.urlParam.pid);
	console.debug("PID from url:", owc.pid);
	if (owc.pid === "")
	{
		if (owc.isPid(window.name) === true)
		{
			console.debug("getting PID from window.name:", window.name);
			owc.pid = window.name;
		}
		else
		{
			owc.pid = owc.generateNewPid();
			console.debug("generating new PID:", owc.pid);
		};
	};
	let warbandCodeUrl = window.location.getParam(owc.urlParam.warband);
	if (warbandCodeUrl !== "")
	{
		console.debug("importing warband from url");
		owc.importWarband(warbandCodeUrl);
	};
	console.debug("finally PID is:", owc.pid);
	/* storing PID into window.name so it' preserved on page refresh */
	window.name = owc.pid;
	/* trying to restore warband from localStorage */
	let storedData = storager.retrieve(owc.pid);
	if (storedData === null)
	{
		owc.editor.newWarband();
	}
	else
	{
		let warbandCode = storedData.data;
		if (warbandCode !== "")
		{
			owc.warband.fromString(warbandCode, owc.resources.data);
		};
	};
	/* continue initialization */
	owc.editor.buildSpecialrulesCollection();
	owc.ui.init();
	if (owc.ui.isPrinting === false)
	{
		/* load additional parts; let's do this parallel asynchronous */
		fileIo.fetchServerFile("./res/didyouknow.json").then((values) =>
		{
			owc.didYouKnow = new DidYouKnow(document.getElementById("didyouknow_text"), values.hints);
			owc.didYouKnow.printRandomHint();
		}
		);
		pageSnippets.import("./snippets/warbandcode.xml").then(() => document.body.appendChild(pageSnippets.produce("warbandcode", warbandcode)));
		pageSnippets.import("snippets/restorer.xml").then(() => document.body.appendChild(pageSnippets.produce("restorer", restorer)));
		pageSnippets.import("./snippets/settings.xml").then(() => document.body.appendChild(pageSnippets.produce("settings", settingsUi)));
	};
	/* We won't waitEnd() here, because there is an async process running: rendering in initView() */
};

owc.isPid = (string) => (/^(?=\D*\d)[\d\w]{6}$/.test(string));

owc.generateNewPid = function ()
{
	let result = "";
	for (let c = 0; c < 6; c += 1)
	{
		let r = Math.floor(Math.random() * 36);
		if (r < 10)
		{
			r += 48;
		}
		else
		{
			r += 97 - 10;
		};
		result += String.fromCharCode(r);
	};
	/* make sure PID contains at least one number */
	if (/[0-9]/.test(result) === false)
	{
		result = owc.generateNewPid();
	};
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

owc.storeWarband = function (pid = owc.pid)
{
	if (pid !== "")
	{
		let warbandCode = owc.warband.toString();
		/* do not store an empty warband (#17) */
		if (owc.warband.isEmpty === false)
		{
			storager.store(pid, owc.helper.nonBlankWarbandName() + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", warbandCode);
		};
	};
};

owc.importWarband = function (warbandText)
{
	console.debug("owc.importWarband", warbandText);
	owc.warband.fromString(warbandText, owc.resources.data);
	let warbandCode = owc.warband.toString();
	let found = false;
	for (let key in localStorage)
	{
		if (owc.isPid(key) === true)
		{
			let storedWarbandCode = JSON.parse(localStorage[key]).data;
			if (storedWarbandCode === warbandCode)
			{
				console.debug("found warband stored at pid", key);
				owc.pid = key;
				found = true;
				break;
			}
		};
	};
	if (found === false)
	{
		owc.pid = owc.generateNewPid();
		console.debug("not found in localStorage");
		owc.storeWarband(owc.pid);
	};
	window.name = owc.pid;
};

owc.getWarbandCode = function (includeComments = owc.settings.options.warbandcodeIncludesComments)
{
	let result = "";
	if (includeComments === true)
	{
		let now = new Date();
		result += "# " + owc.warband.name + "\n";
		let node = document.getElementById("warbandfooter").querySelector("p");
		if (node.innerText !== "")
		{
			result += "# " + node.innerText + "\n";
		};
		result += "# " + now.toIsoFormatText() + "\n";
		result += "# " + owc.meta.origin + "\n";
		result += "\n";
	};
	result += owc.warband.toString();
	return result;
};

/* helper functions */
owc.helper = {};
owc.helper.nonBlankUnitName = (unit) => (unit.name.trim() !== "") ? unit.name : owc.helper.translate("defaultUnitName");
owc.helper.nonBlankWarbandName = () => (owc.warband.name.trim() !== "") ? owc.warband.name : owc.helper.translate("defaultWarbandName");
owc.helper.translate = (key, variables) => owc.resources.translate(key, owc.settings.language, variables);

owc.share = {};
owc.share = function (protocol)
{
	let params = {};
	params[owc.urlParam.warband] = owc.warband.toString();
	let url = window.location.setParams(params, ["console"]);
	console.log("owc.share", protocol, url);
	switch (protocol)
	{
	case "whatsapp":
		let s = "whatsapp://send?text=" + document.head.querySelector("meta[property=\"og:description\"]").getAttribute("content") + "%0D%0A%0D%0A" + url;
		console.log(s);
		window.location.replace(s);
		break;
	default:
		window.location.replace(url);
	};
	// document.head.title = owc.warband.name;
	// window.location.replace("whatsapp://send?text=" + document.head.querySelector("meta[property=\"og:title\"]").getAttribute("content") + "\r\n" + window.location.setParams(params, false, false));
};
