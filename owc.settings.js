"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.settings = {};

owc.settings.init = function ()
{
	owc.settings.STORAGE_KEY = "owc.settings";
	owc.settings.ruleScope = ["sbh", "sgd", "sww"];
	owc.settings.options =
	{
		"highlightPersonalities": true,
		"personalitiesInPoints": false,
		"applyRuleChecks": true,
		"warbandcodeIncludesComments": true
	};
	owc.settings.language = "en";
	owc.settings.viewMode = (owc.ui.isTouchDevice) ? "classictouch" : "classic";
};

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
	for (let key in owc.settings.options)
	{
		if (jsonObject.hasOwnProperty(key))
		{
			owc.settings.options[key] = jsonObject.options[key];
		};
	};
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
	owc.settings.init();
	if (typeof localStorage !== "undefined")
	{
		let storedSettings = JSON.parse(localStorage.getItem(owc.settings.STORAGE_KEY));
		if (storedSettings !== null)
		{
			owc.settings.fromJson(storedSettings);
		};
	};
};
