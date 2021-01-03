"use strict";

owc.rulecheck = {};

owc.rulecheck.checkAll = function ()
{
	let result = [];
	for (let key in owc.rulecheck)
	{
		if ((typeof owc.rulecheck[key] === "function") && (key.startsWith("check") === true) && (key !== "checkAll"))
		{
			let checkResult = owc.rulecheck[key]();
			if (checkResult !== null)
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
			"key": "personalityPointsViolated",
			"values":
			{
				"M": personalityPointsAllowed,
				"C": owc.warband.personalityPoints
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
	let animalUnits = owc.warband.unitsBySpecialrule(animalKey).concat(owc.warband.unitsBySpecialrule(swarmKey));
	for (let u = 0; u < animalUnits.length; u += 1)
	{
		animalPoints += animalUnits[u].points * animalUnits[u].count;
	};
	if (animalPoints > animalPointsAllowed)
	{
		result =
		{
			"key": "animalPointsViolated",
			"values":
			{
				"M": animalPointsAllowed,
				"C": animalPoints
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
	let swarmUnits = owc.warband.unitsBySpecialrule(swarmKey);
	let swarmFigures = 0;
	for (let u = 0; u < swarmUnits.length; u += 1)
	{
		swarmFigures += swarmUnits[u].count;
	};
	if ((swarmFigures > 0) && (swarmFigures < 2))
	{
		result =
		{
			"key": "swarmCountViolated"
		};
	};
	return result;
};

owc.rulecheck.checkPaladinSpecialrule = function ()
{
	/* check paladin special rule:
	>> A Paladin cannot be part of a warband that includes Evil models. <<
	(SGD 4.3, p9) */
	const paladinKey = "pl";
	const evilKey = "ev";
	let result = null;
	if ((owc.warband.unitsBySpecialrule(paladinKey).length > 0) && (owc.warband.unitsBySpecialrule(evilKey).length > 0))
	{
		result =
		{
			"key": "paladinSpecialruleViolated",
			"values":
			{
				"PALADIN": owc.resources.translate(paladinKey, owc.settings.language),
				"EVIL": owc.resources.translate(evilKey, owc.settings.language)
			}
		};
	};
	return result;
};

owc.rulecheck.checkRabbleSpecialrule = function ()
{
	/* check rabble special rule:
	>> Rabble models may not be assigned a Quality score better than 4. <<
	(SBH revised edition/rules version 5.0, p 34). */
	const rabbleKey = "ra";
	let result = [];
	let rabbleUnits = owc.warband.unitsBySpecialrule(rabbleKey);
	for (let u = 0; u < rabbleUnits.length; u += 1)
	{
		if (rabbleUnits[u].quality < 4)
		{
			let checkResult =
			{
				"key": "rabbleSpecialruleViolated",
				"values":
				{
					"U": rabbleUnits[u].name.notEmpty(owc.resources.translate("defaultUnitName", owc.settings.language)),
					"RABBLE": owc.resources.translate(rabbleKey, owc.settings.language)
				}
			};
			result.push(checkResult);
		};
	};
	return result;
};

owc.rulecheck.checkExcludes = function ()
{
	/* check special rules that exclude each other */
	function _checkExcludes(excludingKey, resultsRecipient)
	{
		for (let u = 0; u < owc.warband.units.length; u += 1)
		{
			let unit = owc.warband.units[u];
			let index = [];
			for (let s = 0; s < unit.specialrules.length; s += 1)
			{
				let excludings = owc.resources.data[unit.specialrules[s].key][excludingKey];
				if (excludings !== undefined)
				{
					for (let e = 0; e < excludings.length; e += 1)
					{
						if ((unit.hasSpecialrule(excludings[e]) === true) && (index.includes(excludings[e] + unit.specialrules[s].key) === false))
						{
							let checkResult =
							{
								"key": "specialRuleMismatch",
								"values":
								{
									"U": unit.name.notEmpty(owc.resources.translate("defaultUnitName", owc.settings.language)),
									"A": owc.resources.translate(unit.specialrules[s].key, owc.settings.language),
									"B": owc.resources.translate(excludings[e], owc.settings.language)
								}
							};
							resultsRecipient.push(checkResult);
							index.push(unit.specialrules[s].key + excludings[e]);
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

owc.rulecheck.getText = function (ruleViolation)
{
	let result = owc.resources.translate(ruleViolation.key, owc.settings.language, ruleViolation.values);
	return result;
};
