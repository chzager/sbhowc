"use strict";

class Settings
{
	static get StorageKey()
	{
		return "owcSettings";
	};

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
		localStorage.setItem(Settings.StorageKey, JSON.stringify(this.toJson()));
	};

	load()
	{
		let storedSettings = JSON.parse(localStorage.getItem(Settings.StorageKey));
		if (storedSettings !== null)
		{
			this.fromJson(storedSettings);
		};
	};

};
