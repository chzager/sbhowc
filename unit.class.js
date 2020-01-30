"use strict";

class Unit
{
	static get QualityCombatCodes()
	{
		return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	};

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
		for (let s = 0; s < this.specialrules.length; s += 1)
		{
			specialsPoints = specialsPoints + this.specialrules[s].points;
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
		for (let s = 0; s < this.specialrules.length; s += 1)
		{
			if (this.specialrules[s].isPersonality === true)
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
		for (let s = 0; s < this.specialrules.length; s += 1)
		{
			if (this.specialrules[s].key === specialruleKey)
			{
				result = true;
				break;
			};
		};
		return result;
	};

	addSpecialrule(specialruleKey, resources)
	{
		let result = false;
		let resource = resources[specialruleKey];
		if (resource !== undefined)
		{
			let hasAdditionalText = (resources.defaultText(specialruleKey).indexOf("...") > -1);
			if ((this.hasSpecialrule(specialruleKey) === false) || (hasAdditionalText === true))
			{
				let specialrule =
				{
					"key": specialruleKey,
					"points": resource.points,
					"isPersonality": (resource.personality === true)
				};
				if (hasAdditionalText === true)
				{
					specialrule["additionalText"] = "...";
				};
				this.specialrules.push(specialrule);
				result = true;
			};
		}
		else
		{
			throw "No resource for specialrule \"" + specialruleKey + "\"";
		};
		return result;
	};

	removeSpecialrule(specialruleIndex)
	{
		this.specialrules.remove(specialruleIndex);
	};

	toString()
	{
		let result = "";
		if (this.count > 1)
		{
			result += String.fromCharCode(String("a").charCodeAt(0) + this.count - 1);
		};
		result += Unit.QualityCombatCodes[(this.quality - 2) + (this.combat * 5)];
		result += this.name.replace(/[\s*]/g, "+");
		if (this.specialrules.length > 0)
		{
			result += "*";
			let specialsCode = "";
			let specialTextsCode = "";
			for (let s = 0; s < this.specialrules.length; s += 1)
			{
				let specialrule = this.specialrules[s];
				specialsCode += specialrule.key;
				if (specialrule.additionalText !== undefined)
				{
					specialTextsCode += "!" + specialrule.additionalText;
				};
			};
			result += specialsCode + specialTextsCode;
		};
		return result;
	};

	fromString(unitString, version, resources)
	{
		let offset = 0;
		switch (version)
		{
		case "v1":
			offset = 0;
			if (unitString.charCodeAt(0) < String("a").charCodeAt(0))
			{
				this.count = 1;
				offset = 1;
			}
			else
			{
				this.count = unitString.charCodeAt(0) - String("a").charCodeAt(0) + 1;
				offset = 2;
			};
			let codedName = unitString.substr(offset).match(/^[^*]+/);
			this.name = (codedName !== null) ? codedName[0].replace("+", " ") : "";
			let qcCode = Number(Unit.QualityCombatCodes.indexOf(unitString.substr(offset - 1, 1)));
			this.combat = Math.floor(qcCode / 5);
			this.quality = qcCode - (this.combat * 5) + 2;
			if (unitString.indexOf("*") > -1)
			{
				let unitsSpecialRules = String(unitString.match(/[*].[^!]*/g)).match(/[a-z0-9]{2}/g);
				let unitsSpecialTexts = unitString.match(/![^!]+/g);
				let numberOfSpecialTexts = 0;
				for (let s = 0; s < unitsSpecialRules.length; s += 1)
				{
					this.addSpecialrule(unitsSpecialRules[s], resources);
					let currentSpecialrule = this.specialrules[this.specialrules.length - 1];
					if (currentSpecialrule.additionalText !== undefined)
					{
						if (unitsSpecialTexts !== null)
						{
							currentSpecialrule.additionalText = String(unitsSpecialTexts[numberOfSpecialTexts]).substr(1);
						};
						numberOfSpecialTexts += 1;
					};
				};
			};
			break;
		default:
			throw "Unknown version \"" + version + "\"";
		};
	};

};
