// @ts-check
/**
 * An unit (mostly a single figure) in a _Song of Blades and Heroes_ {@linkcode Warband}.
 */
class Unit
{
	/** Characters to encode quality and combat values to a unit's text code. */
	static VALUE_CODES = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	/**
	 * @param {Warband} warband The warband to which this unit belongs.
	 */
	constructor(warband)
	{
		/** The unique ID for this unit. Mainly for referencing in Editor/Layout. */
		this.id = Math.floor(Math.random() * 1e12).toString(16);
		/** The warband to which this unit belongs. */
		this.warband = warband;
		/** Count of physical figures in this OWC unit item. Default: 1. */
		this.count = 1;
		/** Name of this unit. */
		this.name = "";
		/** Quality of this unit. Range: 2 (best) to 6 (worst), default: 3. */
		this.quality = this.warband.unitDefaults.quality;
		/** Combat value of this unit. Range: 0 (worst) to 6 (best), default: 3. */
		this.combat = this.warband.unitDefaults.combat;
		/** Specialrules of this unit. @type {Array<OwcSpecialruleInstance>} */
		this.specialrules = [];
	}

	/**
	 * @returns The zero-based index of this unit within its warband.
	 */
	get index ()
	{
		return this.warband.units.findIndex(u => (u.id === this.id));
	}

	/**
	 * @returns The point costs of this unit calculated upon its quality, combat value and specialrules.
	 */
	get points ()
	{
		let result = 1;
		const combat = Math.max(this.combat, 1 / 5);
		const specialsPoints = this.specialrules.reduce((p, c) => p + c.points, 0);
		result = Number(Math.round((((combat * 5) + specialsPoints) * (7 - this.quality)) / 2));
		return Math.max(result, 1);
	}

	/**
	 * @returns Whether this unit is a _pesonality_ or not. Certain specialrules make units personalities.
	 */
	get isPersonality ()
	{
		return this.specialrules.some(s => s.isPersonality);
	}

	/**
	 * Tests if this unit has a certain specialrule or not.
	 * @param {string} specialruleKey Id of the specialrule to query.
	 * @returns `true` if the unit does have the queried specialrule, otherwise `false`.
	 */
	hasSpecialrule (specialruleKey)
	{
		return this.specialrules.some(s => s.key === specialruleKey);
	}

	/**
	 * Gives this unit a specialrule.
	 *
	 * This handles the `replaces` directive if defined on the specialrule (e.g. "Shooter (long)" replaces "Shooter (medium)").
	 *
	 * @param {string} specialruleKey Key of specialrule to add.
	 * @returns `true` if the specialrule has been added, otherwiese `false`.
	 */
	addSpecialrule (specialruleKey)
	{
		let result = false;
		const resource = this.warband.specialrulesDirectory.get(specialruleKey);
		if (resource)
		{
			if (!this.hasSpecialrule(specialruleKey))
			{
				/** @type {OwcSpecialruleInstance} */
				const specialrule =
				{
					key: resource.key,
					label: resource.label,
					rulebook: resource.rulebook,
					points: resource.points,
					isPersonality: (resource.personality === true),
					pooling: resource.pooling,
				};
				if (resource.needsSpecification)
				{
					specialrule.additionalText = "...";
				}
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
							}
						}
					}
				}
				if (resource.pooling)
				{
					this.warband.checkPointsPools();
				}
				result = true;
			}
		}
		else
		{
			throw new Error(`No resource for specialrule "${specialruleKey}".`);
		}
		return result;
	}

	/**
	 * Removes a specialrule from this unit's specialrules.
	 * @param {string} specialruleKey Key of special rule to be removed from this unit.
	 */
	removeSpecialrule (specialruleKey)
	{
		this.specialrules.splice(this.specialrules.findIndex(s => (s.key === specialruleKey)), 1);
		this.warband.checkPointsPools();
	}

	/**
	 * Provides a string representation of this unit. This is not human readable, but a serialization, i.e. for
	 * writing in files.
	 */
	toString ()
	{
		let result = "";
		if (this.count > 1)
		{
			result += String.fromCharCode(String("a").charCodeAt(0) + this.count - 1);
		}
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
				}
			}
			result += specialsCode + specialTextsCode;
		}
		return result;
	}

	/**
	 * Returns a copy of this unit in a new object instance.
	 */
	clone ()
	{
		const cloned = new Unit(this.warband);
		cloned.name = this.name;
		cloned.quality = this.quality;
		cloned.combat = this.combat;
		cloned.specialrules = this.specialrules.map(s => Object.assign({}, s));
		return cloned;
	}

	/**
	 * Parses unit data from a string.
	 * @param {string} unitString A unit's string code.
	 * @param {string} [version] The version that was used for generating the unit code.
	 */
	fromString (unitString, version = Warband.CURRENT_VERSION)
	{
		switch (version)
		{
			case "v1":
				const [_m, countCode, qualityCombatCode, name, specialrules] = /([a-z]?)([A-Z0-9])([^*]*)(\*[^!]+)?/.exec(unitString);
				this.name = name.replace(/[+]/g, " ");
				this.count = (!countCode) ? 1 : unitString.charCodeAt(0) - String("a").charCodeAt(0) + 1;
				const qcCode = Number(Unit.VALUE_CODES.indexOf(qualityCombatCode));
				this.combat = Math.floor(qcCode / 5);
				this.quality = qcCode - (this.combat * 5) + 2;
				if (specialrules)
				{
					const unitsSpecialTexts = unitString.match(/![^!]+/g);
					let additionalTextIndex = 0;
					for (const [specialruleKey] of specialrules.matchAll(/[a-z0-9]{2}/g))
					{
						this.addSpecialrule(specialruleKey);
						const currentSpecialrule = this.specialrules[this.specialrules.length - 1];
						if (currentSpecialrule.additionalText)
						{
							if (unitsSpecialTexts)
							{
								currentSpecialrule.additionalText = String(unitsSpecialTexts[additionalTextIndex]).substring(1);
							}
							additionalTextIndex += 1;
						}
					}
				}
				break;
			default:
				throw new Error(`Unknown data version "${version}".`);
		}
		return this;
	}
}

/**
 * A _Song of Blades and Heroes_ warband is a bunch of figures aka {@linkcode Unit}s.
 */
class Warband
{
	/** The current version of the warband text code. */
	static CURRENT_VERSION = "v1";

	/** Character that separates units in the warband text code. */
	static UNIT_SEPARATOR = "@";

	/**
	 * @param {OwcSpecialrulesDirectory} specialrulesDirectory A directory that contains specialrules.
	 */
	constructor(specialrulesDirectory)
	{
		/** The directory that contains specialrules. */
		this.specialrulesDirectory = specialrulesDirectory;
		/** Default quality and combat values for new units. @type {OwcUnitDefaults} */
		this.unitDefaults = { quality: 3, combat: 3 };
		/** The warband's name. */
		this.name = "";
		/** Units of this warband. @type {Array<Unit>} */
		this.units = [];
		/** Warband points stored in (summoning) pools where keys are specialrule keys and values are the points stored in the respective pool. @type {Map<string,number>} */
		this.pointsPools = new Map();
	}

	/**
	 * @returns The points of this warband, calculated as a sum of all units points and all points stored in pools.
	 */
	get points ()
	{
		let result = this.figurePoints;
		for (const poolPoints of this.pointsPools.values())
		{
			result += poolPoints ?? 0;
		}
		return result;
	}

	/**
	 * @returns Total points of all figures (personalities and non-personalities) in this warband.
	 */
	get figurePoints ()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += unit.count * unit.points;
		}
		return result;
	}

	/**
	 * @returns Points of figures in this warband that are recognized personalities.
	 */
	get personalityPoints ()
	{
		let result = 0;
		for (let unit of this.units)
		{
			result += (unit.isPersonality) ? unit.count * unit.points : 0;
		}
		return result;
	}

	/**
	 * @returns Count of figures in this warband. Since a {@linkcode Unit} can has any count of figures (greater than one), the count of warband figures may differ from the count of units in this warband object.
	 */
	get figureCount ()
	{
		return this.units.reduce((previous, current) => previous += current.count, 0);
	}

	/**
	 * @returns Whether this warband has actual units (`false`) or is treated empty (`true`). A warband is recognized as empty if no unit has a name or special rule (https://github.com/chzager/sbhowc/issues/17).
	 */
	get isEmpty ()
	{
		let result = true;
		for (let unit of this.units)
		{
			result = result && (unit.name === "") && (unit.specialrules.length === 0);
		}
		return result;
	}

	/**
	 * Ensures that for all units of this warband with "pooling" specialrules a respective points pool is created.
	 * Unnecessary points pools are removed.
	 */
	checkPointsPools ()
	{
		/** @type {Set<string>} */
		const requiredPools = new Set();
		for (const unit of this.units)
		{
			for (const poolingSpecialrule of unit.specialrules.filter(s => s.pooling))
			{
				const poolKey = poolingSpecialrule.key;
				requiredPools.add(poolKey);
				if (!this.pointsPools.has(poolKey))
				{
					this.pointsPools.set(poolKey, 0);
				}
			}
		}
		for (const poolKey of this.pointsPools.keys())
		{
			if (!requiredPools.has(poolKey))
			{
				this.pointsPools.delete(poolKey);
			}
		}
	}

	/**
	 * Adds an unit to this warband.
	 * @param {Unit} [unit] Unit to be added. If omitted, a new unit with default combat and quality values is created.
	 * @param {number} [index] Zero-based index within the warband's units array where to insert the unit. If omitted, the unit is added at the end.
	 */
	addUnit (unit = new Unit(this), index = undefined)
	{
		unit.warband = this;
		if (isNaN(index))
		{
			this.units.push(unit);
		}
		else
		{
			this.units.splice(index, 0, unit);
		}
		return unit;
	}

	/**
	 * Removes an unit from this warband.
	 * @param {number} unitIndex The zero-based index of the unit in this warband's `units` array.
	 */
	removeUnit (unitIndex)
	{
		this.units.splice(unitIndex, 1);
		this.checkPointsPools();
	}

	/**
	 * Resets the warband's name to blank and removes all units.
	 */
	clear ()
	{
		this.name = "";
		this.units = [];
		this.checkPointsPools();
		return this;
	}

	/**
	 * Provides a string representation of this warband. This is not human readable, but a serialization, i.e. for
	 * writing in files.
	 */
	toString ()
	{
		let result = String(Warband.CURRENT_VERSION + this.name);
		let unitSeparator = Warband.UNIT_SEPARATOR;
		for (let unit of this.units)
		{
			result += unitSeparator;
			result += unit.toString().replace(RegExp(unitSeparator, "g"), "+");
		}
		result = result.replace(/\s/g, "+") + unitSeparator;
		for (const [poolKey, poolPoints] of this.pointsPools.entries())
		{
			if (poolPoints)
			{
				result += poolKey + String(poolPoints) + Warband.UNIT_SEPARATOR;
			}
		}
		return result;
	}

	/**
	 * Parses warband data from a string.
	 * @param {string} code A warband string code.
	 */
	fromString (code)
	{
		this.clear();
		if (code.indexOf("v1") === 0)
		{
			code = code.replace(/[+]/g, " ");
			const segments = code.split(Warband.UNIT_SEPARATOR);
			this.name = segments[0].substring(2);
			for (const unitCode of segments.slice(1))
			{
				if (/^[a-z]{2}\d+$/.test(unitCode))
				{
					this.pointsPools.set(unitCode.substring(0, 2), Number(unitCode.substring(2)));
				}
				else if (unitCode)
				{
					this.addUnit(new Unit(this).fromString(unitCode, "v1"));
				}
			}
			this.checkPointsPools();
		}
		else
		{
			throw new Error(`Can not determine data version in warband code "${code}".`);
		}
	}
}
