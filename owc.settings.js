/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/chzager/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.settings = {
	STORAGE_KEY: "owc_settings",
	init: () =>
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
		owc.settings.fromJson(DEFAULT_SETTINGS);
		owc.settings.viewMode = (owc.ui.isTouchDevice) ? "classictouch" : "classic";
	},
	toJson: () =>
	{
		let result = {};
		for (let key in owc.settings)
		{
			if ((key !== "STORAGE_KEY") && (typeof owc.settings[key] !== "function"))
			{
				result[key] = owc.settings[key];
			}
		}
		return result;
	},
	fromJson: (jsonObject) =>
	{
		Object.assign(owc.settings, jsonObject);
	},
	save: () =>
	{
		if (!!localStorage)
		{
			localStorage.setItem(owc.settings.STORAGE_KEY, JSON.stringify(owc.settings.toJson()));
		}
	},
	load: () =>
	{
		owc.settings.init();
		if (!!localStorage)
		{
			let storedSettings = JSON.parse(localStorage.getItem(owc.settings.STORAGE_KEY));
			if (!!storedSettings)
			{
				owc.settings.fromJson(storedSettings);
			}
		}
	}
};
