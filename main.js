"use strict";

let settings = new Settings();
let resources = new Resources();
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

	let urlWarbandCode = window.location.getParam(urlKeyWarband);
	if (urlWarbandCode !== "")
	{
		owc.warband.fromString(urlWarbandCode, owc.resources);
	};
	initView();
	printWarband();
};

initResources(resources, settings);
