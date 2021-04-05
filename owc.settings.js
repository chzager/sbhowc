"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.settings =
{
	"STORAGE_KEY": "owc.settings"
};

owc.settings.init = function ()
{
	owc.settings.ruleScope = ["sbh", "sgd", "sww"];
	owc.settings.options =
	{
		"highlightPersonalities": true,
		"personalitiesInPoints": false,
		"applyRuleChecks": true,
		"warbandcodeIncludesComments": true
	};
	owc.settings.language = "en";
	owc.settings.defaults = {
		"quality": 3,
		"combat": 3
	};
	owc.settings.viewMode = (owc.ui.isTouchDevice) ? "classictouch" : "classic";
};

owc.settings.toJson = function ()
{
	return new Object(
	{
		"ruleScope": owc.settings.ruleScope,
		"options": owc.settings.options,
		"language": owc.settings.language,
		"defaults": owc.settings.defaults,
		"viewMode": owc.settings.viewMode
	}
	);
};

owc.settings.fromJson = function (jsonObject)
{
	function copyJson(source, target)
	{
		for (let key in source)
		{
			switch (source[key].constructor.name)
			{
				case "Function":
					break;
				case "Object":
					copyJson(source[key], target[key]);
					break;
				default:
					target[key] = source[key];
			};
		};
	};
	copyJson(jsonObject, owc.settings);
};

owc.settings.save = function ()
{
	if (!!localStorage)
	{
		localStorage.setItem(owc.settings.STORAGE_KEY, JSON.stringify(owc.settings.toJson()));
	};
};

owc.settings.load = function ()
{
	owc.settings.init();
	if (!!localStorage)
	{
		let storedSettings = JSON.parse(localStorage.getItem(owc.settings.STORAGE_KEY));
		if (!!storedSettings)
		{
			owc.settings.fromJson(storedSettings);
		};
	};
};
