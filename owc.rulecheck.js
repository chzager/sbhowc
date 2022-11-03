"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.rulecheck = {};

owc.rulecheck.checkAll = function ()
{
	let result = [];
	for (let key in owc.rulecheck)
	{
		if ((typeof owc.rulecheck[key] === "function") && (key.startsWith("check")) && (key !== "checkAll"))
		{
			let checkResult = owc.rulecheck[key]();
			if (!!checkResult)
			{
				if (checkResult.constructor === Array)
				{
					result = result.concat(checkResult);
				}
				else
				{
					result.push(checkResult);
				};
			};
		};
	};
	return result;
};

owc.rulecheck.checkPersonalityPoints = function ()
{
	/* check personality points: max 1/3 of warband points:
	>> players may not have more than one third of the total [...] spent on Personalities <<
	(SBH revised edition/rules version 5.0, p 6). */
	let result = null;
	let personalityPercent = Math.floor(owc.warband.personalityPoints / owc.warband.points * 100);
	if (personalityPercent > 33)
	{
		let personalityPointsAllowed = Number(Math.floor(owc.warband.points / 3));
		result =
		{
			key: "personalityPointsViolated",
			values:
			{
				M: personalityPointsAllowed,
				C: owc.warband.personalityPoints
			}
		};
	};
	return result;
};

owc.rulecheck.checkAnimalPoints = function ()
{
	/* check animal points: max 1/2 of warband points:
	>> No more than 50% of the members of a warband may be animals. <<
	(SHB 4.3, p 11)
	Though this is not stated in SHB 5.0, I believe it's still valid.	*/
	const animalKey = "an";
	const swarmKey = "sw";
	let result = null;
	let animalPoints = 0;
	let animalPointsAllowed = Number(Math.floor(owc.warband.points / 2));
	for (let animalUnit of owc.warband.unitsBySpecialrule(animalKey).concat(owc.warband.unitsBySpecialrule(swarmKey)))
	{
		animalPoints += animalUnit.points * animalUnit.count;
	};
	if (animalPoints > animalPointsAllowed)
	{
		result =
		{
			key: "animalPointsViolated",
			values:
			{
				M: animalPointsAllowed,
				C: animalPoints
			}
		};
	};
	return result;
};

owc.rulecheck.checkSwarmFigures = function ()
{
	/* check swarm figures:
	>> A complete Swarm is represented by two or more swarm bases. <<
	(SBH revised edition/rules version 5.0, p 35). */
	const swarmKey = "sw";
	let result = null;
	let swarmFigures = 0;
	for (let swarmUnit of owc.warband.unitsBySpecialrule(swarmKey))
	{
		swarmFigures += swarmUnit.count;
	};
	if ((swarmFigures > 0) && (swarmFigures < 2))
	{
		result =
		{
			key: "swarmCountViolated"
		};
	};
	return result;
};

owc.rulecheck.checkPaladinSpecialrule = function ()
{
	/* check paladin specialrule:
	>> A Paladin cannot be part of a warband that includes Evil models. <<
	(SGD 4.3, p9) */
	const paladinKey = "pl";
	const evilKey = "ev";
	let result = null;
	if ((owc.warband.unitsBySpecialrule(paladinKey).length > 0) && (owc.warband.unitsBySpecialrule(evilKey).length > 0))
	{
		result =
		{
			key: "paladinSpecialruleViolated",
			values:
			{
				PALADIN: owcResources.translate(paladinKey, owcSettings.language),
				EVIL: owcResources.translate(evilKey, owcSettings.language)
			}
		};
	};
	return result;
};

owc.rulecheck.checkRabbleSpecialrule = function ()
{
	/* check rabble specialrule:
	>> Rabble models may not be assigned a Quality score better than 4. <<
	(SBH revised edition/rules version 5.0, p 34). */
	const rabbleKey = "ra";
	let result = [];
	for (let rabbleUnit of owc.warband.unitsBySpecialrule(rabbleKey))
	{
		if (rabbleUnit.quality < 4)
		{
			let checkResult =
			{
				key: "rabbleSpecialruleViolated",
				values:
				{
					U: owc.helper.nonBlankUnitName(rabbleUnit),
					RABBLE: owcResources.translate(rabbleKey, owcSettings.language)
				}
			};
			result.push(checkResult);
		};
	};
	return result;
};

owc.rulecheck.checkExcludes = function ()
{
	/* check specialrules that exclude each other */
	function _checkExcludes (excludingKey, resultsRecipient)
	{
		for (let unit of owc.warband.units)
		{
			let index = [];
			for (let specialrule of unit.specialrules)
			{
				let excludings = owcResources.data[specialrule.key][excludingKey];
				if (excludings !== undefined)
				{
					for (let excluding of excludings)
					{
						if ((unit.hasSpecialrule(excluding)) && (index.includes(excluding + specialrule.key) === false))
						{
							let checkResult =
							{
								key: "specialRuleMismatch",
								values:
								{
									U: owc.helper.nonBlankUnitName(unit),
									A: owcResources.translate(specialrule.key, owcSettings.language),
									B: owcResources.translate(excluding, owcSettings.language)
								}
							};
							resultsRecipient.push(checkResult);
							index.push(specialrule.key + excluding);
						};
					};
				};
			};
		};
	};
	let result = [];
	_checkExcludes("exclusive", result);
	_checkExcludes("excludes", result);
	return result;
};

owc.rulecheck.getText = (ruleViolation) => owcResources.translate(ruleViolation.key, owcSettings.language, ruleViolation.values);
