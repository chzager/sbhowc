"use strict";

class AbstractView
{
	constructor(settings, warbandCreatorResources, printToNode)
	{
		this._settings = settings;
		this._resources = warbandCreatorResources;
		this._specialrules = [];
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
		for (let key in this._resources)
		{
			let resource = this._resources[key];
			if (this._specialruleIsInScope(key) === true)
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

	_specialruleIsInScope(specialruleKey)
	{
		let result = this._settings.ruleScope.includes(this._resources[specialruleKey].scope);
		return result;
	};

	applySettings(settings)
	{
		this._settings = settings;
		this._specialrules = this._getSpecialrulesList();
	};
	
	translate(resourceId, placeholders)
	{
		let result = this._resources.translate(resourceId, this._settings.language, placeholders);
		return result;
	};
	
	printWarband(warband)
	{
		throw "Call of abstract method";
	};

	printWarbandName(warband, targetNode = this.html)
	{
		throw "Call of abstract method";
	};

	printWarbandSummary(warband, targetNode = this.html)
	{
		throw "Call of abstract method";
	};
	
	printUnit(unit, unitIndex, targetNode = this.html)
	{
		throw "Call of abstract method";
	};

};
