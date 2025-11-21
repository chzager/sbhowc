// @ts-check
// ALL OK 2025-11-17
/**
 * Checker for compliance of a warband compilation against all requirements of the rules.
 */
class WarbandValidator
{
	/**
	 * @param {Warband} warband Warband to be validated.
	 * @param {OwcLocalizer} localizer Provider of localization functionality.
	 */
	constructor(warband, localizer)
	{
		/** Warband to be validated. */
		this.warband = warband;
		/** Provider of localization functionality. */
		this.localizer = localizer;
	}

	/**
	 * Performs all validation checks on the warband.
	 * @returns An array of all found rule violations as localized texts.
	 */
	validate ()
	{
		const result = this.#checks
			.map(c => c()) // Execute all check methods.
			.flat() // Flatten the results.
			.filter(Boolean) // Remove nulls.
			.map(r => this.localizer.translate(r.key, r.values)); // Localize.
		return result;
		/* Developer's note: Surley the whole thing could be done in less code while being more performant,
		 * using one single loop over all units and their special rules. But I decided to keep every
		 * requirement of the rules in a separate code block to keep logical clusters. Regarding Performance:
		 * this can be disregarded with this amount of data.
		 */
	}

	/**
	 * Selects all units that have a certain specialrule.
	 * @param {string} specialruleKey Key of specialrule to select.
	 * @returns {Array<Unit>} All units that do have the queried specialrule.
	 */
	#getUnitsWithSpecialrule (specialruleKey)
	{
		return this.warband.units.filter(u => u.specialrules.some(s => s.key === specialruleKey));
	}

	/**
	 * Actual validation methods.
	 * @type {Array<OwcValidationFunction>}}
	 */
	#checks = [
		// Personalities must be at most 1/3 of warband points. (SBH v4.3, p. 16, SBH v5, p. 6)
		() =>
		{
			const personalityPercent = Math.floor(this.warband.personalityPoints / this.warband.points * 100);
			if (personalityPercent > 33)
			{
				const personalityPointsAllowed = Number(Math.floor(this.warband.points / 3));
				return { key: "personalityPointsViolated", values: { MAX: personalityPointsAllowed, CURRENT: this.warband.personalityPoints } };
			}
		},

		// Animals (including swarms) must not make up more than 1/2 of warband points. (SBH v4.3, p. 11, SBH v4.3, p. 15)
		() =>
		{
			const ANIMAL = "an";
			const SWARM = "sw";
			let animalPoints = this.#getUnitsWithSpecialrule(ANIMAL)
				.concat(this.#getUnitsWithSpecialrule(SWARM))
				.reduce((p, c) => p + c.points * c.count, 0);
			const animalPointsAllowed = Number(Math.floor(this.warband.points / 2));
			if (animalPoints > animalPointsAllowed)
			{
				return { key: "animalPointsViolated", values: { MAX: animalPointsAllowed, CURRENT: animalPoints } };
			}
		},

		// A complete swarm must be represented of two or more bases. (SBH v5, p. 35)
		() =>
		{
			const SWARM = "sw";
			let swarmFigures = this.#getUnitsWithSpecialrule(SWARM).reduce((p, c) => p + c.count, 0);
			if ((swarmFigures > 0) && (swarmFigures < 2))
			{
				return { key: "swarmCountViolated" };
			}
		},

		// Incompatible units:
		// A Paladin cannot be part of a warband that includes Evil models. (SGD, p. 9)
		// A Sorcerer cannot be in the same warband as a Cleric. (SGD, p. 9)
		() =>
		{
			const incompatibles = [["pl", "ev"], ["sc", "cc"]];
			const result = [];
			for (const [sr1, sr2] of incompatibles)
			{
				if ((this.#getUnitsWithSpecialrule(sr1).length > 0) && (this.#getUnitsWithSpecialrule(sr2).length > 0))
				{
					result.push({ key: "incompatibleUnitsViolated", values: { A: this.localizer.translate(sr1), B: this.localizer.translate(sr2) } });
				}
			}
			return result;
		},

		// An unit with the "rabble" specialrule must not have a quality better than 4+. (SBH v5, p.34)
		() =>
		{
			const RABBLE = "ra";
			const result = [];
			for (const rabbleUnit of this.#getUnitsWithSpecialrule(RABBLE))
			{
				if (rabbleUnit.quality < 4)
				{
					result.push({ key: "rabbleSpecialruleViolated", values: { UNIT: this.localizer.nonBlankUnitName(rabbleUnit.name), RABBLE: this.localizer.translate(RABBLE) } });
				}
			}
			return result;
		},

		// Check for specialrules that exclude each other within an unit (according to "variants" and "excludes" properties).
		// See the respective description of the specialrules in the corresponding rulebooks).
		() =>
		{
			const result = [];
			for (const unit of this.warband.units)
			{
				const mem = new Set();
				for (const specialrule of unit.specialrules)
				{
					for (const property of ["variants", "excludes"])
					{
						const uniqueKeys = this.warband.specialrulesDirectory.get(specialrule.key)[property];
						for (const uniqueKey of uniqueKeys ?? [])
						{
							if (!mem.has(uniqueKey + specialrule.key) && unit.hasSpecialrule(uniqueKey))
							{
								result.push({ key: "specialRuleMismatch", values: { UNIT: this.localizer.nonBlankUnitName(unit.name), A: this.localizer.translate(specialrule.key), B: this.localizer.translate(uniqueKey) } });
								mem.add(specialrule.key + uniqueKey);
							}
						}
					}
				}
			}
			return result;
		}
	];
}
