"use strict";

class AbstractView
{
	constructor(settings, warbandCreatorResources, printToNode)
	{
		this.settings = settings;
		this.resources = warbandCreatorResources;
		this.specialrulesList = [];
		this.html = printToNode;
		this.applySettings(settings);
	};

	_getSpecialrulesList()
	{
		function compareByText(a, b)
		{
			let compareResult = 0;
			let aCompareValue = a.text.toLowerCase();
			let bCompareValue = b.text.toLowerCase();
			if (aCompareValue < bCompareValue)
			{
				compareResult = -1;
			}
			else if (aCompareValue > bCompareValue)
			{
				compareResult = 1;
			};
			return compareResult;
		};
		let specialruleCollecion = [];
		for (let key in this.resources.data)
		{
			let resource = this.resources.data[key];
			if (this.isSpecialruleInScope(key) === true)
			{
				let specialrule = {};
				specialrule["key"] = key;
				specialrule["text"] = this.translate(key);
				specialruleCollecion.push(specialrule);
			};
		};
		specialruleCollecion.sort(compareByText);
		specialruleCollecion.splice(0, 0,
		{
			"key": "",
			"text": this.translate("addSpecialrule")
		}
		);
		return specialruleCollecion;
	};

	isSpecialruleInScope(specialruleKey)
	{
		let result = this.settings.ruleScope.includes(this.resources.data[specialruleKey].scope);
		return result;
	};

	applySettings(settings)
	{
		this.settings = settings;
		this.specialrulesList = this._getSpecialrulesList();
	};

	translate(resourceId, placeholders)
	{
		let result = this.resources.translate(resourceId, this.settings.language, placeholders);
		return result;
	};

	printWarband(warband)
	{
		throw "Call of abstract method";
	};

	printWarbandName(warband)
	{
		throw "Call of abstract method";
	};

	printWarbandSummary(warband)
	{
		throw "Call of abstract method";
	};

	printUnit(unit, unitIndex)
	{
		throw "Call of abstract method";
	};

};
