"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

class Unit
{
	static VALUE_CODES = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	static DEFAULT_LANGUAGE = "en";

	constructor()
	{
		this.count = 1;
		this.name = "";
		this.quality = 3;
		this.combat = 3;
		this.specialrules = [];
	};

	get points()
	{
		let result = 1;
		let combat = this.combat;
		if (combat === 0)
		{
			combat = 1 / 5;
		};
		let specialsPoints = 0;
		for (let specialrule of this.specialrules)
		{
			specialsPoints = specialsPoints + specialrule.points;
		};
		result = Number(Math.round((((combat * 5) + specialsPoints) * (7 - this.quality)) / 2));
		if (result < 1)
		{
			result = 1;
		};
		return result;
	};

	get isPersonality()
	{
		let result = false;
		for (let specialrule of this.specialrules)
		{
			if (specialrule.isPersonality)
			{
				result = true;
				break;
			};
		};
		return result;
	};

	hasSpecialrule(specialruleKey)
	{
		let result = false;
		for (let specialrule of this.specialrules)
		{
			if (specialrule.key === specialruleKey)
			{
				result = true;
				break;
			};
		};
		return result;
	};

	addSpecialrule(specialruleKey, specialrulesDictionary)
	{
		let result = false;
		let resource = specialrulesDictionary[specialruleKey];
		if (resource !== undefined)
		{
			let hasAdditionalText = (specialrulesDictionary[specialruleKey][Unit.DEFAULT_LANGUAGE].includes("..."));
			if ((this.hasSpecialrule(specialruleKey) === false) || (hasAdditionalText))
			{
				let specialrule =
				{
					"key": specialruleKey,
					"points": resource.points,
					"isPersonality": (resource.personality === true)
				};
				if (hasAdditionalText)
				{
					specialrule["additionalText"] = "...";
				};
				this.specialrules.push(specialrule);
				if (resource.replaces !== undefined)
				{
					for (let r = 0, rr = resource.replaces.length; r < rr; r += 1)
					{
						for (let s = 0, ss = this.specialrules.length; s < ss; s += 1)
						{
							if (this.specialrules[s].key === resource.replaces[r])
							{
								this.specialrules.copyWithin(s, ss - 1);
								this.specialrules.pop();
								break;
							};
						}
					};
				};
				result = true;
			};
		}
		else
		{
			throw new Error("No resource for specialrule \"" + specialruleKey + "\".");
		};
		return result;
	};

	removeSpecialrule(specialruleIndex)
	{
		this.specialrules.splice(specialruleIndex, 1);
	};

	toString()
	{
		let result = "";
		if (this.count > 1)
		{
			result += String.fromCharCode(String("a").charCodeAt(0) + this.count - 1);
		};
		result += Unit.VALUE_CODES[(this.quality - 2) + (this.combat * 5)];
		result += this.name.replace(/[\s*]/g, "+");
		if (this.specialrules.length > 0)
		{
			result += "*";
			let specialsCode = "";
			let specialTextsCode = "";
			for (let specialrule of this.specialrules)
			{
				specialsCode += specialrule.key;
				if (!!specialrule.additionalText)
				{
					specialTextsCode += "!" + specialrule.additionalText;
				};
			};
			result += specialsCode + specialTextsCode;
		};
		return result;
	};

	fromString(unitString, version, specialrulesDictionary)
	{
		const RXGROUP_COUNT = 1;
		const RYGROUP_QUALITY_COMBAT_VALUE = 2;
		const RXGROUP_NAME = 3;
		const RXGROUP_SPECIALRULES = 4;
		switch (version)
		{
		case "v1":
			let rexResult = /([a-z]?)([A-Z0-9])([^*]*)(\*[^!]+)?/.exec(unitString);
			if (rexResult[RXGROUP_COUNT] === "")
			{
				this.count = 1;
			}
			else
			{
				this.count = unitString.charCodeAt(0) - String("a").charCodeAt(0) + 1;
			};
			let qcCode = Number(Unit.VALUE_CODES.indexOf(rexResult[RYGROUP_QUALITY_COMBAT_VALUE]));
			this.combat = Math.floor(qcCode / 5);
			this.quality = qcCode - (this.combat * 5) + 2;
			this.name = rexResult[RXGROUP_NAME].replace(/[+]/g, " ");
			if (rexResult[RXGROUP_SPECIALRULES] !== undefined)
			{
				let unitsSpecialRules = rexResult[RXGROUP_SPECIALRULES].match(/[a-z0-9]{2}/g);
				let unitsSpecialTexts = unitString.match(/![^!]+/g);
				let additionalTextIndex = 0;
				for (let s = 0, ss = unitsSpecialRules.length; s < ss; s += 1)
				{
					this.addSpecialrule(unitsSpecialRules[s], specialrulesDictionary);
					let currentSpecialrule = this.specialrules[this.specialrules.length - 1];
					if (!!currentSpecialrule.additionalText)
					{
						if (!!unitsSpecialTexts)
						{
							currentSpecialrule.additionalText = String(unitsSpecialTexts[additionalTextIndex]).substr(1);
						};
						additionalTextIndex += 1;
					};
				};
			};
			break;
		default:
			throw new Error("Unknown data version \"" + version + "\".");
		};
	};
};
