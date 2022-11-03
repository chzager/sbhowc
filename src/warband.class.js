/**
 * This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
 * Copyright 2021 Christoph Zager
 * Licensed unter the GNU Affero General Public License, Version 3
 * See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * A _Song of Blades and Heroes_ warband is a bunch of figures aka `Unit`s.
 */
class Warband
{
	static CURRENT_VERSION = "v1";
	static UNIT_SEPARATOR = "@";
	static POINTSPOOLS = {
		'ee': "elementalSummonPool",
		'sm': "summonPool"
	};

	/**
	 * The warbands name.
	 * @type {string}
	 */
	name;

	/**
	 * Units of this warband.
	 * @type {Array<Unit>}
	 */
	units;

	/**
	 * Warband points stored in (summoning) pools.
	 *
	 * Members of this record come from `Warband.POINTSPOOLS` member values.
	 *
	 * @type {{elementalSummonPool: number|null, summonPool: number|null}}
	 */
	pointsPools;

	constructor()
	{
		this.name = "";
		this.units = [];
		this.pointsPools = {};
	};

	/**
	 * The points of this warband, calculated as a sum of all units points and all points stored in pools.
	 */
	get points ()
	{
		let result = this.figurePoints;
		for (let poolName in this.pointsPools)
		{
			result += (this.pointsPools[poolName] ?? 0);
		};
		return result;
	};

	/**
	 * Total points of all figures (_personalities_ and non-personalities) in this warband.
	 */
	get figurePoints ()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += unit.count * unit.points;
		};
		return result;
	};

	/**
	 * Points of figures in this warband that are recognized _personalities_.
	 *
	 * Points of personalities  must not exceed a certain ratio.
	 */
	get personalityPoints ()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += (unit.isPersonality) ? unit.count * unit.points : 0;
		};
		return result;
	};

	/**
	 * Count of figures in this warband. Since a `Unit` can be declared valid for any count of figures,
	 * the count of warband figures may differ from the count of units in this warband object.
	 */
	get figureCount ()
	{
		return this.units.reduce((previous, current) => previous += current.count, 0);
	};

	/**
	 * Whether this warband does have actual units (`false`) or is treated empty (`true`).
	 *
	 * A warband is recognized as empty as long as no unit has a name or a specialrule.
	 * See https://github.com/Suppenhuhn79/sbhowc/issues/17
	 */
	get isEmpty ()
	{
		let result = true;
		for (let unit of this.units)
		{
			result = result && (unit.name === "") && (unit.specialrules.length === 0);
		};
		return result;
	};

	/**
	 * Checks if any unit of this warband does have a specialrule that enables a points pool.
	 * If such an unit is found, the corresponding points pool is activated (gets an integer value),
	 * otherwise the points pool is deactivated (value is set to `null`).
	 */
	checkPointsPools ()
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

	/**
	 * Adds an unit to this warband.
	 *
	 * This replaces the `addSpecialrule()` and `removeSpecialrule()` methods of the unit so they
	 * trigger checks for enabling/disabling warband point pools.
	 *
	 * Also, by adding an unit it is checked to enable point pools.
	 *
	 * @param {Unit} unit Unit to add.
	 */
	addUnit (unit)
	{
		/* replace Unit default functions with Warband replacer functions */
		unit._$addSpecialrule = unit.addSpecialrule;
		unit._$removeSpecialrule = unit.removeSpecialrule;
		unit.addSpecialrule = (specialruleKey, specialrulesDictionary) =>
		{
			let result = unit._$addSpecialrule(specialruleKey, specialrulesDictionary);
			if (!!Warband.POINTSPOOLS[specialruleKey])
			{
				this.checkPointsPools();
			};
			return result;
		};
		unit.removeSpecialrule = (specialruleIndex) =>
		{
			let result = unit._$removeSpecialrule(specialruleIndex);
			if (!!Warband.POINTSPOOLS[unit.specialrules[specialruleIndex].key])
			{
				this.checkPointsPools();
			};
			return result;
		};
		this.units.push(unit);
	};

	/**
	 * Removes an unit from this warband.
	 * @param {number} unitIndex Index of the unit in this warbands `units` array.
	 */
	removeUnit (unitIndex)
	{
		this.units.splice(unitIndex, 1);
		this.checkPointsPools();
	};

	/**
	 * Selects all units that do posses a certain specialrule.
	 * @param {string} specialruleKey Id of specialrule to select.
	 * @returns {Array<Unit>} All units that do posses the queried specialrule.
	 */
	unitsBySpecialrule (specialruleKey)
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

	/**
	 * Resets the warbands name to blank ans removes all units.
	 */
	clear ()
	{
		this.name = "";
		this.units = [];
		this.checkPointsPools();
	};

	/**
	 * Provides a string representation of this warband. This is not human readable, but a serialization, i.e. for
	 * writing in files.
	 * @returns {string} This warbands string code.
	 */
	toString ()
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
			if (this.pointsPools[pointsPool] !== null)
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

	/**
	 * Parses warband data from a string.
	 * @param {string} string A warband string code.
	 * @param {SpecialrulesDictionary} specialrulesDictionary Dictionary to look up specialrules properties.
	 */
	fromString (string, specialrulesDictionary)
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
