/**
 * This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
 * Copyright 2021 Christoph Zager
 * Licensed unter the GNU Affero General Public License, Version 3
 * See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * @typedef SpecialrulePrototype
 * A basic specialrule property definition. This comes out ouf resources files.
 * @property {string} en The english (native) name of this specialrule.
 * Note that a `SpecialrulePrototype` may have names for other languages, loaded from additional resources.
 * These will add further object members named after the language key.
 * @property {number} points Points costs of this specialrule.
 * @property {string} scope Rulebook that introduces this specialrule (abbreviation).
 * @property {boolean} [personality] Whether this specialrule makes a unit a _personaliy_ (`true`) or not (`false`).
 * @property {Array<string>} [replaces] Ids of other specialrules that a replaced by this specialrule (e.g. "Shooter (long)" replaces "Shooter (medium)").
 * @property {Array<string>} [exclusive] Ids of other specialrules that are excluded for units having this specialrule.
 * In Distinction to `excludes`, exclusive specialrules are multidirectional and exclusive to all each other,
 * e.g. "Elementalist", "Magic User", "Summoner" etc. are all exclusive to each other.
 * @property {Array<string>} [excludes] Ids of other specialrules that are excluded for units having this specialrule.
 * In Distinction to `exclusive`, excludes are unidirectional, e.g. "Coward" excludes "Fearless", "Hero" and "Steadfast",
 * but none of these three excludes any other.
 *
 * @typedef Specialrule
 * Special ability for a unit.
 * @property {string} key This specialrules id as reference to the specialrules resource.
 * @property {number} points Points costs of this specialrule.
 * @property {boolean} isPersonality Whether this specialrule makes the unit a _personaliy_ (`true`) or not (`false`).
 * @property {string} [additionalText] Additional text that specifies this specialrule it in more detail.
 *
 * @typedef SpecialrulesDictionary
 * A dictionary of specialrules. Keys are specialules ids.
 * @type {{[k: string]: SpecialrulePrototype}}
 */

/**
 * A single figure in _Song of Blades and Heroes_.
 */
class Unit
{
	static VALUE_CODES = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	static DEFAULT_LANGUAGE = "en";

	/**
	 * Count of figures in this OWC unit item. Default: `1`.
	 * @type {number}
	 */
	count;

	/**
	 * Name of this unit.
	 * @type {string}
	 */
	name;

	/**
	 * Quality of this unit. Range 2 (best) to 6 (worst), default: `3`.
	 * @type {number}
	 */
	quality;

	/**
	 * Combat value of this unit. Range 0 (worst) to 6 (best), default: `3`.
	 * @type {number}
	 */
	combat;

	/**
	 * Specialrules of this unit.
	 * @type {Array<Specialrule>}
	 */
	specialrules;

	constructor()
	{
		this.count = 1;
		this.name = "";
		this.quality = 3;
		this.combat = 3;
		this.specialrules = [];
	};

	/**
	 * The points costs of this unit calculated upon its quality, combat value and specialules.
	 */
	get points ()
	{
		let result = 1;
		let combat = Math.max(this.combat, 1 / 5);
		// if (combat === 0)
		// {
		// combat = 1 / 5;
		// };
		let specialsPoints = 0;
		for (let specialrule of this.specialrules)
		{
			specialsPoints = specialsPoints + specialrule.points;
		};
		result = Number(Math.round((((combat * 5) + specialsPoints) * (7 - this.quality)) / 2));
		return Math.max(result, 1);
	};

	/**
	 * Whether this unit is a _pesonality_ (`true`) or not (`false`). Certains specialrules make units personlities.
	 */
	get isPersonality ()
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

	/**
	 * Tests if this unit has a certain specialrule or not.
	 * @param {string} specialruleKey Id of the specialrule to query.
	 * @returns {boolean} `true` if the unit does have the queried specialrule, otherwise `false`.
	 */
	hasSpecialrule (specialruleKey)
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

	/**
	 * Gives this unit a specialrule.
	 *
	 * If the units already has the specialrule, it will not be added a further time, expect for it gets
	 * sepcified in more detail via an additional text.
	 *
	 * If the specialrules dictionary marks the given specialrule as replacer and this unit does posses the replaced
	 * specialrule, it actually gets replaced (e.g. "Shooter (long)" replaces "Shooter (medium)").
	 *
	 * @param {string} specialruleKey Id of specialrule to add.
	 * @param {SpecialrulesDictionary} specialrulesDictionary Dictionary to look up specialrules properties.
	 * @returns {boolean} `true` if the specialrule has been added, otherwiese `false`.
	 */
	addSpecialrule (specialruleKey, specialrulesDictionary)
	{
		let result = false;
		let resource = specialrulesDictionary[specialruleKey];
		if (resource !== undefined)
		{
			let hasAdditionalText = (specialrulesDictionary[specialruleKey][Unit.DEFAULT_LANGUAGE].includes("..."));
			if ((this.hasSpecialrule(specialruleKey) === false) || (hasAdditionalText))
			{
				/** @type {Specialrule} */
				let specialrule =
				{
					key: specialruleKey,
					points: resource.points,
					isPersonality: (resource.personality === true)
				};
				if (hasAdditionalText)
				{
					specialrule.additionalText = "...";
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

	/**
	 * Removes a specialrule from this units specialrules.
	 * @param {number} specialruleIndex Index in this units `specialrules` to be removed.
	 */
	removeSpecialrule (specialruleIndex)
	{
		this.specialrules.splice(specialruleIndex, 1);
	};

	/**
	 * Provides a string representation of this unit. This is not human readable, but a serialization, i.e. for
	 * writing in files.
	 * @returns {string} This units string code.
	 */
	toString ()
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

	/**
	 * Parses unit data from a string.
	 * @param {string} unitString A units string code.
	 * @param {"v1"} version The version that was used for generating the unit code.
	 * @param {SpecialrulesDictionary} specialrulesDictionary Dictionary to look up specialrules properties.
	 */
	fromString (unitString, version, specialrulesDictionary)
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
