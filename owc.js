"use strict";

let owc = {};

owc.urlParam =
{
	"warband": "warband",
	"print": "print",
	"pid": "pid"
};
owc.TITLE = "Song of Blades and Heroes Online Warband Creator";
owc.VERSION = "Jan21 release";
owc.warband = null;

owc.init = function (pid)
{
	console.debug("owc.init", pid);
	let result = (pid !== "");
	if (result === false)
	{
		let warbandCodeUrl = window.location.getParam(owc.urlParam.warband);
		if (warbandCodeUrl !== "")
		{
			console.debug("importing warband from url");
			owc.importWarband(warbandCodeUrl);
		}
		else
		{
			owc.setPid(owc.generateNewPid());
			console.debug("new pid set; reloading blank");
		};
	}
	else
	{
		owc.pid = pid;
	};
	return result;
};

owc.main = function ()
{
	console.debug("owc.main");
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

	editor.buildSpecialrulesCollection();
	ui.initView();

	if (ui.isInteractive === true)
	{
		didYouKnow.init();
	};
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
		location.setParams(pidParam, false);
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
	for (let r = 0, rr = requiredKeys.length; r < rr; r += 1)
	{
		requireResource(requiredKeys[r], owc.resources.DEFAULT_LANGUAGE);
	};
	/* eventually require some resources for set language */
	if (owc.settings.language !== owc.resources.DEFAULT_LANGUAGE)
	{
		requireResource("meta", owc.settings.language);
		for (let r = 0, rr = owc.settings.ruleScope.length; r < rr; r += 1)
		{
			requireResource("specialrules-" + owc.settings.ruleScope[r], owc.settings.language);
		};
	};
	owc.resources.import(requiredResoures, owc.main);
};

owc.storeWarband = function (pid = owc.pid)
{
	if (pid !== "")
	{
		let warbandCode = owc.warband.toString();
		/* do not store an empty warband (#17) */
		if (owc.warband.isEmpty === false)
		{
			storager.store(pid, owc.helper.getWarbandName() + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", warbandCode);
		};
	};
};

owc.importWarband = function (warbandCode)
{
	console.debug("owc.importWarband", warbandCode);
	let newPid = "";
	for (let key in localStorage)
	{
		if (/^(?=\D*\d)[\d\w]{6}$/.test(key) === true)
		{
			let storedWarbandCode = JSON.parse(localStorage[key]).data;
			if (storedWarbandCode === warbandCode)
			{
				console.debug("found warband stored at pid", key);
				newPid = key;
				break;
			}
		};
	};
	if (newPid === "")
	{
		console.debug("not found in localStorage");
		newPid = owc.generateNewPid();
		console.debug("new pid is", newPid);
		owc.warband.fromString(warbandCode, owc.resources.data);
		owc.storeWarband(newPid);
	};
	console.debug("reloading with pid", newPid);
	owc.setPid(newPid);
};

/* helper functions */
owc.helper = {};
owc.helper.getUnitName = (unitIndex) => owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName"));
owc.helper.getWarbandName = () => owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName"));
