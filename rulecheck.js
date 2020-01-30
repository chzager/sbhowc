"use strict";

/*
owc.warband.fromString("v1Unnamed+warband@GUnnamed+unit*ancwhr@")
r = new RulesCheck()
r.check(owc.warband, owc.specialrules)
*/


let RulesCheck = function()
{
	RulesCheck.prototype.check = function(warband, specialrulesProvider)
	{
		let result = [];
		let animalPointsCheck = checkAnimalPoints(warband);
		if (animalPointsCheck)
		{
			result.push(animalPointsCheck);
		}
		result = result.concat(checkExcludes(warband, specialrulesProvider));
		return result;
	}
	
	let checkAnimalPoints = function(warband)
	{
		// check animal points (max 1/2)
		let result = {};
		let warbandPoints = warband.points();
		let animalPointsAllowed = Number(Math.floor(warbandPoints / 2));
		let animalPoints = 0;
		for (let u = 0; u < warband.units.length; u += 1)
		{
			if (warband.units[u].hasSpecial("an") || warband.units[u].hasSpecial("sw"))
			{
				animalPoints += warband.units[u].points() * warband.units[u].count;
			}
		}
		if (animalPoints > animalPointsAllowed)
		{
			result = { "check": "animalPoints", "pointsallowed": animalPointsAllowed, "pointscurrent": animalPoints }
		}
		return result;
	}
	
	let checkExcludes = function(warband, specialrulesProvider)
	{
		// check specialrules exclusions
		let result = [];
		for (let u = 0; u < warband.units.length; u += 1)
		{
			let unit = warband.units[u];
			// let unitSpecialrules = [];
			let excludingSpecialrules = [];
			for (let s = 0; s < unit.specials.length; s += 1)
			{
				// unitSpecialrules.push(warband.units[u].specials[s]);
				let currentExcludings = specialrulesProvider.getExcludes(unit.specials[s])
				for (let e = 0; e < currentExcludings.length; e += 1)
				{
					let matchIndex = unit.specials.indexOf(currentExcludings[e]);
					if (matchIndex >= 0)
					{
						result.push({
							"check": "excludes",
							"unitid": u,
							"specialrules": [ unit.specials[matchIndex], currentExcludings[e]]
						});
					}
				}
			}
		}
		return result;
	}
	
	return this;
}


function CheckRules()
{
	let result = String();
	if (options.applyRuleChecks() === true)
	{
		let warbandPoints = Number(warband.points());
		// check personality points (max 1/3)
		let warbandPersonalitiesPoints = Number(warband.personalityPoints());
		let personalityPointsAllowed = Number(Math.floor(warbandPoints / 3));
		if (warbandPersonalitiesPoints > personalityPointsAllowed)
		{ result += '&#32;' + translate(12, '{M}', personalityPointsAllowed); }
		/*
		// check animal points (max 1/2)
		let animalPoints = Number(0);
		let u = Number();
		let s = Number();
		let e = Number();
		let z = Number();
		for (u = 0; u < warband.units.length; u += 1)
		{
			if (warband.units[u].hasSpecial('an') || warband.units[u].hasSpecial('sw'))
			{ animalPoints += warband.units[u].count * warband.units[u].points(); }
		}
		let animalPointsAllowed = Number(Math.floor(warbandPoints / 2));
		if (animalPoints > animalPointsAllowed)
		{ result += '&#32;' + translate(13, ['{M}','{C}'], [animalPointsAllowed,animalPoints]); }
	*/
		// check specialrules exclusions
		for (u = 0; u < warband.units.length; u++)
		{
			for (s = 0; s < warband.units[u].specials.length; s += 1)
			{
				for (e = 0; e < SpecialrulesExclusions.length; e += 1)
				{
					if (warband.units[u].specials[s].id.substr(0, 2) === SpecialrulesExclusions[e][0])
					{
						//console.log(warband.units[u].name + ': ' + SpecialrulesExclusions[e][0] + ' // ' + SpecialrulesExclusions[e][1] + ' (' + e + ')');
						for (z = 0; z < warband.units[u].specials.length; z += 1)
						{
							if (z !== s)
							{
								if (String(SpecialrulesExclusions[e][1] + '/').indexOf(warband.units[u].specials[z].id.substr(0, 2) + '/') > -1)
								{
									result += '&#32;' + translate(14, ['{U}','{A}','{B}'], [warband.units[u].name,specialrules.textOf(SpecialrulesExclusions[e][0]),specialrules.textOf(warband.units[u].specials[z].id)]);
								}
								//console.log(' ... ' + warband.units[u].specials[z].id.substr(0, 2) + ' \\ ' + SpecialrulesExclusions[e][1] + ' (' + String(SpecialrulesExclusions[e][1] + '/').indexOf(warband.units[u].specials[z].id.substr(0, 2) + '/') + ')');
							}
						}
					}
				}
			}
		}
		//
		if (result !== '')
		{ result = '<p style="color:red;">' + translate(11) + result + '</p>'; }
	}
	return result;
}