"use strict";

let owc = {};

owc.urlParam =
{
	"warband": "warband",
	"print": "print",
	"pid": "pid"
};
owc.TITLE = "Song of Blades and Heroes Online Warband Creator";
owc.pid = window.location.getParam(owc.urlParam.pid);
owc.warband = null;

owc.init = function ()
{
	let result = true;
	if (owc.pid === "")
	{
		let pid = owc.generateNewPid();
		let warbandCodeUrl = window.location.getParam(owc.urlParam.warband);
		if (warbandCodeUrl !== "")
		{
			storager.store(pid, "", warbandCodeUrl);
		};
		result = false;
		owc.setPid(pid);
		console.debug("reloading");
	};
	return result;
};

owc.setPid = function (newPid, newWindow = false)
{
	let pidParam = {};
	pidParam[owc.urlParam.pid] = newPid;
	if (newWindow === true)
	{
		window.open(window.location.setParams(pidParam, false, false));
	}
	else
	{
		location.setParams(pidParam);
	};
};

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
	function requireResource(key, lang)
	{
		requiredResoures.push("./res/" + lang + "/" + key + "." + lang + ".json");
	};
	let requiredResoures = [];
	let requiredKeys = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
	/* require all resources for default language */
	for (let r = 0; r < requiredKeys.length; r += 1)
	{
		requireResource(requiredKeys[r], owc.resources.DEFAULT_LANGUAGE);
	};
	/* eventually require some resources for set language */
	if (owc.settings.language !== owc.resources.DEFAULT_LANGUAGE)
	{
		requireResource("meta", owc.settings.language);
		for (let r = 0; r < owc.settings.ruleScope.length; r += 1)
		{
			requireResource("specialrules-" + owc.settings.ruleScope[r], owc.settings.language);
		};
	};
	owc.resources.import(requiredResoures, owc.main);
};

owc.main = function ()
{
	console.debug("owc.main()");
	owc.warband = new Warband();
	let storedData = storager.retrieve(owc.pid);
	if (storedData === null)
	{
		editor.newWarband();
	}
	else
	{
		let warbandCode = storedData.data;
		if (warbandCode !== "")
		{
			owc.warband.fromString(warbandCode, owc.resources.data);
		};
	};

	editor.getSpecialrulesList();
	ui.initView();

	if (ui.isInteractive === true)
	{
		window.initEventListeners();
		didYouKnow.init();
	};
};

owc.storeWarband = function ()
{
	if (owc.pid !== "")
	{
		let warbandCode = owc.warband.toString();
		/* do not store an empty warband (#17) */
		if (owc.warband.isEmpty === false)
		{
			storager.store(owc.pid, owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", warbandCode);
		};
	};
};
