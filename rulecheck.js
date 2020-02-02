"use strict";

function getRulesCheckResult(warband, resources, settings)
{
	function checkPersonalityPoints(warband, toFailsContainer)
	{
		// check personality points (max 1/3)
		let warbandPoints = Number(warband.points);
		let warbandPersonalitiesPoints = Number(warband.personalityPoints);
		let personalityPointsAllowed = Number(Math.floor(warbandPoints / 3));
		if (warbandPersonalitiesPoints > personalityPointsAllowed)
		{
			let checkResult =
			{
				"check": "personalitypoints",
				"points":
				{
					"allowed": personalityPointsAllowed,
					"current": warbandPersonalitiesPoints
				}
			};
			toFailsContainer.push(checkResult);
		};
	};

	function checkAnimalPoints(warband, toFailsContainer)
	{
		// check animal points (max 1/2)
		let warbandPoints = warband.points;
		let animalPointsAllowed = Number(Math.floor(warbandPoints / 2));
		let animalPoints = 0;
		for (let u = 0; u < warband.units.length; u += 1)
		{
			if ((warband.units[u].hasSpecialrule("an") === true) || (warband.units[u].hasSpecialrule("sw") === true))
			{
				animalPoints += warband.units[u].points * warband.units[u].count;
			};
		};
		if (animalPoints > animalPointsAllowed)
		{
			let checkResult =
			{
				"check": "animalpoints",
				"points":
				{
					"allowed": animalPointsAllowed,
					"current": animalPoints
				}
			};
			toFailsContainer.push(checkResult);
		};
	};

	function checkSwarmFigures(warband, toFailsContainer)
	{
		let swarmFigures = 0;
		for (let u = 0; u < warband.units.length; u += 1)
		{
			if (warband.units[u].hasSpecialrule("sw") === true)
			{
				swarmFigures += warband.units[u].count;
			};
		};
		if (swarmFigures < 2)
		{
			let checkResult =
			{
				"check": "swarmfigures"
			};
			toFailsContainer.push(checkResult);
		};
	};

	function checkExcludes(warband, specialrulesProvider, toFailsContainer)
	{
		function _checkExcludes(warband, specialrulesProvider, excludingKey, toFailsContainer)
		{
			for (let u = 0; u < warband.units.length; u += 1)
			{
				let unit = warband.units[u];
				let index = [];
				for (let s = 0; s < unit.specialrules.length; s += 1)
				{
					let excludings = specialrulesProvider[unit.specialrules[s].key][excludingKey];
					if (excludings !== undefined)
					{
						for (let e = 0; e < excludings.length; e += 1)
						{
							if ((unit.hasSpecialrule(excludings[e]) === true) && (index.includes(excludings[e] + unit.specialrules[s].key) === false))
							{
								let checkResult =
								{
									"check": "excludes",
									"unitindex": u,
									"specialrules": [unit.specialrules[s].key, excludings[e]]
								};
								toFailsContainer.push(checkResult);
								index.push(unit.specialrules[s].key + excludings[e]);
							};
						};
					};
				};
			};
		};
		// check specialrules exclusions
		_checkExcludes(warband, specialrulesProvider, "exclusive", toFailsContainer);
		_checkExcludes(warband, specialrulesProvider, "excludes", toFailsContainer);
	};

	let result = [];
	checkPersonalityPoints(warband, result);
	checkAnimalPoints(warband, result);
	checkExcludes(warband, resources, result);
	checkSwarmFigures(warband, result);
	return result;
};

function getRulesCheckResultAsTexts(warband, resources, settings)
{
	let result = [];
	let failedChecks = getRulesCheckResult(warband, resources, settings);
	for (let f = 0; f < failedChecks.length; f += 1)
	{
		let faildCheck = failedChecks[f];
		switch (faildCheck.check)
		{
		case "personalitypoints":
			result.push(resources.translate("personalityPointsViolated", settings.language,
				{
					"M": faildCheck.points.allowed
				}
				));
			break;
		case "animalpoints":
			result.push(resources.translate("animalPointsViolated", settings.language,
				{
					"M": faildCheck.points.allowed,
					"C": faildCheck.points.current
				}
				));
			break;
		case "swarmfigures":
			result.push(resources.translate("swarmCountViolated", settings.language));
			break;
		case "excludes":
			result.push(resources.translate("specialRuleMismatch", settings.language,
				{
					"U": warband.units[faildCheck.unitindex].name.notEmpty(resources.defaultText("defaultUnitName")),
					"A": resources.translate(faildCheck.specialrules[0], settings.language),
					"B": resources.translate(faildCheck.specialrules[1], settings.language)
				}
				));
			break;
		};
	};
	return result;
};
