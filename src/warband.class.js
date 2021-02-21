"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

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
		for (let unit of this.units)
		{
			result += unit.count * unit.points;
		};
		return result;
	};

	get personalityPoints()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += (unit.isPersonality) ? unit.count * unit.points : 0;
		};
		return result;
	};

	get figureCount()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += unit.count;
		};
		return result;
	};

	get isEmpty()
	{
		/* A warband counts as empty as long as no unit has a name or a special rule. (see https://github.com/Suppenhuhn79/sbhowc/issues/17) */
		let result = true;
		for (let unit of this.units)
		{
			result = result && (unit.name === "") && (unit.specialrules.length === 0);
		};
		return result;
	};

	unitsBySpecialrule(specialruleKey)
	{
		let result = [];
		for (let unit of this.units)
		{
			if (unit.hasSpecialrule(specialruleKey))
			{
				result.push(unit);
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
		for (let unit of this.units)
		{
			result += unitSeparator;
			result += unit.toString().replace(RegExp(unitSeparator, "g"), "+");
		};
		result = result.replace(/\s/g, "+") + unitSeparator;
		return result;
	};

	fromString(string, specialrulesDictionary)
	{
		let unitSeparator = Warband.UNIT_SEPARATOR;
		if (string.indexOf("v1") === 0)
		{
			this.clear();
			string = string.replace(/[+]/g, " ");
			this.name = string.substring(2, string.indexOf(unitSeparator));
			let unitsRegex = /@([^@]+)/g;
			let unitsFind;
			while (unitsFind = unitsRegex.exec(string))
			{
				let unit = new Unit();
				unit.fromString(unitsFind[1], "v1", specialrulesDictionary);
				this.units.push(unit);
			};
		}
		else
		{
			throw new Error("Can not determine data version in warband code \"" + string + "\".");
		};
	};
};
