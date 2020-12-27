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
					for (let r = 0; r < checkResult.length; r += 1)
					{
						result.push(checkResult[r]);
					};
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
	/* check personality points: max 1/3 of warband points */
	let result = null;
	let warbandPoints = Number(owc.warband.points);
	let warbandPersonalitiesPoints = Number(owc.warband.personalityPoints);
	let personalityPointsAllowed = Number(Math.floor(warbandPoints * 0.34));
	if (warbandPersonalitiesPoints > personalityPointsAllowed)
	{
		result =
		{
			"key": "personalityPointsViolated",
			"values":
			{
				"M": personalityPointsAllowed,
				"C": warbandPersonalitiesPoints
			}
		};
	};
	return result;
};

owc.rulecheck.checkAnimalPoints = function ()
{
	/* check animal points: max 1/2 of warband points */
	let result = null;
	let warbandPoints = owc.warband.points;
	let animalPointsAllowed = Number(Math.floor(warbandPoints / 2));
	let animalPoints = 0;
	for (let u = 0; u < owc.warband.units.length; u += 1)
	{
		let unit = owc.warband.units[u];
		if ((unit.hasSpecialrule("an") === true) || (unit.hasSpecialrule("sw") === true))
		{
			animalPoints += unit.points * unit.count;
		};
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
	/* check swarm figures: must be at least two units with "swarm" special rule */
	let result = null;
	let swarmFigures = 0;
	for (let u = 0; u < owc.warband.units.length; u += 1)
	{
		let unit = owc.warband.units[u];
		if (unit.hasSpecialrule("sw") === true)
		{
			swarmFigures += unit.count;
		};
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
