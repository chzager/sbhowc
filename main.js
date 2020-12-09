"use strict";

let settings = new Settings();
let resources = new Resources();
let storage = new Storager();

let owc;

function initResources(resources, settings)
{
	function requireResource(key, lang)
	{
		requiredResoures.push("./res/" + lang + "/" + key + "." + lang + ".json");
	};
	let requiredResoures = [];
	let requiredKeys = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
	for (let r = 0; r < requiredKeys.length; r += 1)
	{
		requireResource(requiredKeys[r], resources.defaultLanguage);
	};
	if (settings.language !== resources.defaultLanguage)
	{
		for (let r = 0; r < requiredKeys.length; r += 1)
		{
			requireResource(requiredKeys[r], settings.language);
		};
	};
	resources.import(requiredResoures, main);
};

function main()
{
	console.debug("main()");
	owc = new WarbandCreator(settings, resources);

	let warbandCode = window.location.getParam(urlParam.warband);
	let pid = window.location.getParam(urlParam.pid);
	if (pid !== "")
	{
		let storedData = storage.retrieve(urlParam.pid + "=" + pid);
		if (typeof storedData !== "undefined")
		{
			warbandCode = storedData.data;
		};
	}
	else if (warbandCode !== "")
	{
		if (warbandCode !== "")
		{
			let pidParam = {};
			pidParam[urlParam.pid] = generateNewPid();
			owc.warband.fromString(warbandCode, owc.resources);
			storeWarband();
			location.setParams(pidParam, true, true);
		};
	};
	if (warbandCode !== "")
	{
		owc.warband.fromString(warbandCode, owc.resources);
	};
	initView();
	printWarband();
};

initResources(resources, settings);
