"use strict";

let settings = new Settings();
let resources = new Resources();
let owc;

function initResources(language)
{
	let requiredResoures = [];
	let requiredKeys = ["meta", "specialrules-sbh", "specialrules-sww", "specialrules-sgd", "specialrules-sdg", "specialrules-sam"];
	function requireResource(key)
	{
		requiredResoures.push("./res/" + language + "/" + key + "." + language + ".json");
	};
	// requireResource("meta");
	for (let r = 0; r < requiredKeys.length; r += 1)
	{
		requireResource(requiredKeys[r]);
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

initResources(resources.defaultLanguage);
if (settings.language !== resources.defaultLanguage)
{
	initResources(settings.language);
};
