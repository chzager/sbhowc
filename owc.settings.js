/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owcSettings = {

	STORAGE_KEY: "owc_settings",

	init: function ()
	{
		const DEFAULT_SETTINGS = {
			ruleScope: ["sbh", "sgd", "sww"],
			options: {
				highlightPersonalities: true,
				personalitiesInPoints: false,
				applyRuleChecks: true,
				warbandcodeIncludesComments: true
			},
			language: "en",
			defaults: {
				quality: 3,
				combat: 3
			},
			viewMode: "classic"
		};
		owcSettings.fromJson(DEFAULT_SETTINGS);
		owcSettings.viewMode = (owc.ui.isTouchDevice) ? "classictouch" : "classic";
	},

	toJson: function ()
	{
		let result = {};
		for (let key in owcSettings)
		{
			if ((key !== "STORAGE_KEY") && (typeof owcSettings[key] !== "function"))
			{
				result[key] = owcSettings[key];
			}
		}
		return result;
	},

	fromJson: function (jsonObject)
	{
		Object.assign(owcSettings, jsonObject);
	},

	save: function ()
	{
		if (!!localStorage)
		{
			localStorage.setItem(owcSettings.STORAGE_KEY, JSON.stringify(owcSettings.toJson()));
		}
	},

	load: function ()
	{
		owcSettings.init();
		if (!!localStorage)
		{
			let storedSettings = JSON.parse(localStorage.getItem(owcSettings.STORAGE_KEY));
			if (!!storedSettings)
			{
				owcSettings.fromJson(storedSettings);
			}
		}
	}
};
