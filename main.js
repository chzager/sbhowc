"use strict";

let settings = new Settings();
let resources = new Resources();
let storage = new Storager();

let interactiveMode = (window.location.getParam(urlParam.print) !== "1");

let owc;
let view;

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

function initEventListeners()
{
	window.addEventListener("resize", windowEventListener);
	window.addEventListener("focus", onWindowFocus);
	window.addEventListener("editor", editorEventListener);
	window.addEventListener("menubox", windowEventListener);
};

function main()
{
	console.debug("main()");
	owc = new WarbandCreator(settings, resources);

	let pid = window.location.getParam(urlParam.pid);
	let storedData = storage.retrieve(pid);
	if (typeof storedData !== "undefined")
	{
		let warbandCode = storedData.data;
		console.debug("restored warband", warbandCode);
		if (warbandCode !== "")
		{
			owc.warband.fromString(warbandCode, owc.resources);
		};
	};

	initView();
	printWarband();

	if (interactiveMode === true)
	{
		initEventListeners();
		initDidYouKnow();
	};
};
