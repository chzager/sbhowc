"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let owc =
{
	"urlParam":
	{
		"warband": "warband",
		"print": "print",
		"pid": "pid"
	},
	"meta":
	{
		"TITLE": "Online Warband Creator for Song of Blades and Heroes",
		"VERSION": "Feb21 draft",
		"ORIGIN": "https://suppenhuhn79.github.io/sbhowc"
	},
	"STORAGE_VERSION_KEY": "owc.version",
	"warband": null
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
		htmlBuilder.removeNodesByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
	owc.manageStorage();
	owc.warband = new Warband();
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
	/* getting PID (https://github.com/Suppenhuhn79/sbhowc/issues/13#issuecomment-774077538) */
	let pid = window.location.getParam(owc.urlParam.pid);
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
	let warbandCodeUrl = window.location.getParam(owc.urlParam.warband);
	if (warbandCodeUrl !== "")
	{
		console.debug("importing warband from url");
		owc.importWarband(warbandCodeUrl);
	}
	else
	{
		/* trying to restore warband from localStorage */
		if (owc.restoreWarband(pid) === false)
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
				[owc.urlParam.pid]: owc.pid
			}, ["console"]));
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

owc.storeWarband = function ()
{
	let warbandCode = owc.warband.toString();
	/* do not store an empty warband (#17) */
	if (owc.warband.isEmpty === false)
	{
		storager.store(owc.pid, owc.helper.nonBlankWarbandName() + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", warbandCode);
	};
};

owc.restoreWarband = function (pid = owc.pid)
{
	let result = false;
	let storedData = storager.retrieve(pid);
	if ((!!storedData) && (storedData.data !== ""))
	{
		owc.warband.fromString(storedData.data, owc.resources.data);
		owc.ui.notify("Warband restored.");
		owc.setPid(pid);
		result = true;
	};
	return result;
};

owc.importWarband = function (warbandCode)
{
	let tempWarband = new Warband();
	tempWarband.fromString(warbandCode, owc.resources.data);
	warbandCode = tempWarband.toString();
	console.debug("owc.importWarband", warbandCode);
	let found = false;
	for (let key in localStorage)
	{
		if (owc.isPid(key))
		{
			let storedWarbandCode = JSON.parse(localStorage[key]).data;
			if (storedWarbandCode === warbandCode)
			{
				console.debug("found warband stored at pid", key);
				owc.restoreWarband(key);
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
		owc.storeWarband();
		owc.ui.notify("New warband imported.");
	};
	return !found;
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

owc.manageStorage = function ()
{
	if ((!!localStorage) && (localStorage.getItem(owc.STORAGE_VERSION_KEY) !== owc.meta.VERSION))
	{
		console.debug("Managing localStorage");
		for (let key in localStorage)
		{
			if (owc.isPid(key) === false)
			{
				localStorage.removeItem(key);
			};
		};
		localStorage.setItem(owc.STORAGE_VERSION_KEY, owc.meta.VERSION);
	};
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
	}
		);
	switch (protocol)
	{
	case "whatsapp":
		{
			/* need to escape characters:  %  +  */
			let s = "whatsapp://send?text=*" + _unicodify(document.title, "*") + "*%0d%0a" + _unicodify(url, "+");
			console.log("owc.share()", protocol, s);
			window.open(s);
		};
		break;
	case "facebook":
		{
			let s = "https://www.facebook.com/sharer/sharer.php?u=" + url + "&t=" + document.title;
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
		window.open("mailto:?subject=" + document.title + "&body=" + url);
		break;
	case "link":
		history.replaceState({}, "", url);
		owc.ui.notify("Link created. Ready to share.");
		break;
	case "browser":
		if (typeof navigator.share === "function")
		{
			navigator.share(
			{
				"title": document.title,
				"text": owc.helper.warbandSummary(),
				"url": url
			}
			).then(() => null, (reason) => console.error(reason));
		};
		break;
	default:
		console.warn("owc.share()", "Unknown protocol \"" + protocol + "\"");
	};
};
