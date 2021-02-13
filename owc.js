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
	"TITLE": "Online Warband Creator for Song of Blades and Heroes",
	"VERSION": "Feb21 draft",
	"ORIGIN": "https://suppenhuhn79.github.io/sbhowc"
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
			text = text.replace("{{" + key.toLowerCase() + "}}", owc.meta[key]);
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
		pageSnippets.import("./snippets/warbandcode.xml").then(() => document.body.appendChild(pageSnippets.produce("warbandcode", warbandcode)));
		pageSnippets.import("./snippets/restorer.xml").then(() => document.body.appendChild(pageSnippets.produce("restorer", restorer)));
		pageSnippets.import("./snippets/settings.xml").then(() => document.body.appendChild(pageSnippets.produce("settings", settingsUi)));
	};
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
	owc.ui.initView();
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

owc.share = {};
owc.share = function (protocol)
{
	function _unicodify(text, chars = "")
	{
		chars = "%" + chars;
		for (let c = 0, cc = chars.length; c < cc; c += 1)
		{
			text = text.replaceAll(chars[c], "%" + chars.charCodeAt(c).toString(16));
		};
		return text;
	};
	let url = window.location.setParams(
	{
		[owc.urlParam.warband]: owc.warband.toString()
	}, ["console"]);
	switch (protocol)
	{
	case "whatsapp":
		{
			/* need to escape characters:  %  +  */
			let s = "whatsapp://send?text=*" + owc.helper.nonBlankWarbandName() + "*%0d%0a" + _unicodify(owc.helper.warbandSummary()) + "%0d%0a" + _unicodify(url, "+");
			console.log("owc.share()", protocol, s);
			window.open(s);
		};
		break;
	case "facebook":
		{
			let s = "https://www.facebook.com/sharer/sharer.php?u=<URL>&t=<TITLE>";
				console.log("owc.share()", protocol, s);
		};
		break;
	case "twitter":
		{
			/* max tweet lenght: 280 chars */
			let title = owc.helper.nonBlankWarbandName() + "%0a";
			let s = "https://twitter.com/share?url=" + _unicodify(decodeURI(url), "+") + "&text=" + title;
			console.log("owc.share()", protocol, s);
			window.open(s);
		};
		break;
	case "email":
		window.open("mailto:?subject=" + owc.helper.nonBlankWarbandName() + " - " + owc.meta.TITLE + "&body=" + url);
		break;
	case "link":
		window.open(url);
		break;
	default:
		console.warn("owc.share()", "Unknown protocol \"" + protocol + "\"");
	};
};
