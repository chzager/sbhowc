"use strict";

class Warband
{
	static get CurrentDataVersion()
	{
		return "v1";
	};

	static get UnitSeparator()
	{
		return "@";
	};

	constructor()
	{
		this.name = "";
		this.units = [];
		this.clear();
	};

	get points()
	{
		let result = 0;
		for (let u = 0; u < this.units.length; u += 1)
		{
			result += this.units[u].count * this.units[u].points;
		};
		return result;
	};

	get personalityPoints()
	{
		let result = 0;
		for (let u = 0; u < this.units.length; u += 1)
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
		for (let u = 0; u < this.units.length; u += 1)
		{
			result += this.units[u].count;
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
		let result = String(Warband.CurrentDataVersion + this.name);
		let unitSeparator = Warband.UnitSeparator;
		for (let u = 0; u < this.units.length; u += 1)
		{
			result += unitSeparator;
			result += this.units[u].toString().replace(RegExp(unitSeparator, "g"), "+");
		};
		result = result.replace(/\s/g, "+") + unitSeparator;
		return encodeURI(result);
	};

	fromString(warbandString, specialrulesProvider)
	{
		let unitSeparator = Warband.UnitSeparator;
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
				unit.fromString(unitsFind[1], "v1", specialrulesProvider);
				this.units.push(unit);
			};
		}
		else
		{
			throw "Can not determinate data version.";
		};
	};

};
