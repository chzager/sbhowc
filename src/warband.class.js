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
	static POINTSPOOLS =
	{
		"ee": "elementalSummonPool",
		"sm": "summonPool"
	};

	constructor()
	{
		this.name = "";
		this.units = [];
		this.pointsPools = {};
	};

	get points()
	{
		let result = this.figurePoints;
		for (let poolName in this.pointsPools)
		{
			result += (this.pointsPools[poolName] ?? 0);
		};
		return result;
	};

	get figurePoints()
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

	checkPointsPools()
	{
		for (let poolKey in Warband.POINTSPOOLS)
		{
			let poolName = Warband.POINTSPOOLS[poolKey];
			if (this.unitsBySpecialrule(poolKey).length > 0)
			{
				this.pointsPools[poolName] = (this.pointsPools[poolName] ?? 0);
			}
			else
			{
				this.pointsPools[poolName] = null;
			};
		};
	};

	addUnit(unit)
	{
		const warband = this;
		function _addSpecialruleReplacer(specialruleKey, specialrulesDictionary)
		{
			let result = unit._$addSpecialrule(specialruleKey, specialrulesDictionary);
			if (!!Warband.POINTSPOOLS[specialruleKey])
			{
				warband.checkPointsPools();
			};
			return result;
		};
		function _removeSpecialruleReplacer(specialruleIndex)
		{
			let specialruleKey = unit.specialrules[specialruleIndex].key;
			let result = unit._$removeSpecialrule(specialruleIndex);
			if (!!Warband.POINTSPOOLS[specialruleKey])
			{
				warband.checkPointsPools();
			};
			return result;
		};
		/* replace Unit default functions with Warband replacer functions */
		unit._$addSpecialrule = unit.addSpecialrule;
		unit._$removeSpecialrule = unit.removeSpecialrule;
		unit.addSpecialrule = _addSpecialruleReplacer;
		unit.removeSpecialrule = _removeSpecialruleReplacer;
		this.units.push(unit);
	};
	
	removeUnit(unitIndex)
	{
		this.units.splice(unitIndex, 1);		
		this.checkPointsPools();
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
		for (let pointsPool in this.pointsPools)
		{
			if (this.pointsPools[pointsPool] > 0)
			{
				for (let pointsPoolKey in Warband.POINTSPOOLS)
				{
					if (Warband.POINTSPOOLS[pointsPoolKey] === pointsPool)
					{
						result += pointsPoolKey + String(this.pointsPools[pointsPool]) + Warband.UNIT_SEPARATOR;
						break;
					};
				};
			};
		};
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
				if (!!Warband.POINTSPOOLS[unitsFind[1].substr(0, 2)])
				{
					this.pointsPools[Warband.POINTSPOOLS[unitsFind[1].substr(0, 2)]] = Number(unitsFind[1].substr(2));
				}
				else
				{
				let unit = new Unit();
				unit.fromString(unitsFind[1], "v1", specialrulesDictionary);
				this.addUnit(unit);
				};
			};
			this.checkPointsPools();
		}
		else
		{
			throw new Error("Can not determine data version in warband code \"" + string + "\".");
		};
	};
};
