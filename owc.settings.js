"use strict";

owc.settings = {};

owc.settings.STORAGE_KEY = "owcSettings";
owc.settings.ruleScope = ["sbh", "sgd", "sww"];
owc.settings.options =
{
	"highlightPersonalities": true,
	"personalitiesInPoints": false,
	"applyRuleChecks": true
};
owc.settings.language= "en";
owc.settings.viewMode = "classic";

owc.settings.toJson = function ()
{
	let result =
	{
		ruleScope: owc.settings.ruleScope,
		options: owc.settings.options,
		language: owc.settings.language,
		viewMode: owc.settings.viewMode
	};
	return result;
};

owc.settings.fromJson = function (jsonObject)
{
	owc.settings.ruleScope = jsonObject.ruleScope;
	owc.settings.options = jsonObject.options;
	owc.settings.language = jsonObject.language;
	owc.settings.viewMode = jsonObject.viewMode;
};

owc.settings.save = function ()
{
	if (typeof localStorage !== "undefined")
	{
		localStorage.setItem(owc.settings.STORAGE_KEY, JSON.stringify(owc.settings.toJson()));
	};
};

owc.settings.load = function ()
{
	if (typeof localStorage !== "undefined")
	{
		let storedSettings = JSON.parse(localStorage.getItem(owc.settings.STORAGE_KEY));
		if (storedSettings !== null)
		{
			owc.settings.fromJson(storedSettings);
		};
	};
};
