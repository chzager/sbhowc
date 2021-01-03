"use strict";

class Warband
{
	static CURRENT_VERSION = "v1";
	static UNIT_SEPARATOR = "@";

	constructor()
	{
		this.name = "";
		this.units = [];
	};

	get points()
	{
		let result = 0;
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			result += this.units[u].count * this.units[u].points;
		};
		return result;
	};

	get personalityPoints()
	{
		let result = 0;
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			if (this.units[u].isPersonality === true)
			{
				result += this.units[u].count * this.units[u].points;
			};
		};
		return result;
	};

	get figureCount()
	{
		let result = 0;
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			result += this.units[u].count;
		};
		return result;
	};

	get isEmpty()
	{
		/* A warband counts as empty as long as no unit has a name or a special rule. (see https://github.com/Suppenhuhn79/sbhowc/issues/17) */
		let result = true;
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			result = result && (this.units[u].name === "") && (this.units[u].specialrules.length === 0);
		};
		return result;
	};

	unitsBySpecialrule(specialruleKey)
	{
		let result = [];
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			if (this.units[u].hasSpecialrule(specialruleKey) === true)
			{
				result.push(this.units[u]);
			};
		};
		return result;
	};

	clear()
	{
		this.name = "";
		this.units = [];
	};

	toString()
	{
		let result = String(Warband.CURRENT_VERSION + this.name);
		let unitSeparator = Warband.UNIT_SEPARATOR;
		for (let u = 0, uu = this.units.length; u < uu; u += 1)
		{
			result += unitSeparator;
			result += this.units[u].toString().replace(RegExp(unitSeparator, "g"), "+");
		};
		result = result.replace(/\s/g, "+") + unitSeparator;
		return encodeURI(result);
	};

	fromString(warbandString, specialrulesDictionary)
	{
		let unitSeparator = Warband.UNIT_SEPARATOR;
		warbandString = decodeURI(warbandString).trim();
		if (warbandString.indexOf("v1") === 0)
		{
			this.clear();
			warbandString = warbandString.replace(/[+]/g, " ");
			this.name = warbandString.substring(2, warbandString.indexOf(unitSeparator));
			let unitsRegex = /@([^@]+)/g;
			let unitsFind;
			while (unitsFind = unitsRegex.exec(warbandString))
			{
				let unit = new Unit();
				unit.fromString(unitsFind[1], "v1", specialrulesDictionary);
				this.units.push(unit);
			};
		}
		else
		{
			throw "Can not determinate data version.";
		};
	};
};
