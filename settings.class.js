"use strict";

class Settings
{
	static STORAGE_KEY = "owcSettings";

	constructor()
	{
		this.ruleScope = ["sbh", "sgd", "sww"];
		this.options =
		{
			highlightPersonalities: true,
			personalitiesInPoints: false,
			applyRuleChecks: true
		};
		this.language = "en";
		this.viewMode = "classic";
		this.load();
	};

	toJson()
	{
		let result =
		{
			ruleScope: this.ruleScope,
			options: this.options,
			language: this.language,
			viewMode: this.viewMode
		};
		return result;
	};

	fromJson(jsonObject)
	{
		this.ruleScope = jsonObject.ruleScope;
		this.options = jsonObject.options;
		this.language = jsonObject.language;
		this.viewMode = jsonObject.viewMode;
	};

	save()
	{
		if (typeof localStorage !== "undefined")
		{
			localStorage.setItem(Settings.STORAGE_KEY, JSON.stringify(this.toJson()));
		}
		else
		{
			console.warn("localStorage not availible. Can not save settings.");
		};
	};

	load()
	{
		if (typeof localStorage !== "undefined")
		{
			let storedSettings = JSON.parse(localStorage.getItem(Settings.STORAGE_KEY));
			if (storedSettings !== null)
			{
				this.fromJson(storedSettings);
			};
		}
		else
		{
			console.warn("localStorage not availible.");
		};
	};

};
