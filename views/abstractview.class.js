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
	
	createWarbandNameEditorNode()
	{
		let node = dhtml.createNode("input", "",
			{
				"type": "text",
				"maxlength": "150",
				"data-editor": "warbandname",
				"placeholder": this.translate("defaultWarbandName"),
				"onmouseover": "this.focus();",
				"onmouseout": "this.blur();"
			}
			);
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createUnitNameEditorNode(unitIndex)
	{
		let node = dhtml.createNode("input", "",
			{
				"type": "text",
				"maxlength": "150",
				"placeholder": this.translate("defaultUnitName"),
				"data-editor": "name",
				"data-unitindex": unitIndex,
				"onmouseover": "this.focus();"
			}
			);
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createUnitCountEditorNode(unitIndex)
	{
		let node = dhtml.createNode("input", "",
			{
				"type": "number",
				"min": "1",
				"max": "25",
				"maxlength": "2",
				"data-editor": "count",
				"data-unitindex": unitIndex,
				"onmouseover": "this.focus();"
			}
			);
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createUnitQualityEditorNode(unitIndex)
	{
		let node = dhtml.createNode("select", "",
			{
				"size": "1",
				"data-editor": "quality",
				"data-unitindex": unitIndex
			}
			);
		for (let q = 2; q <= 6; q += 1)
		{
			node.appendChild(dhtml.createNode("option", "",
				{
					"value": q
				}, q.toString() + "+"));
		};
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createUnitCombatscoreEditorNode(unitIndex)
	{
		let node = dhtml.createNode("select", "",
			{
				"size": "1",
				"data-editor": "combat",
				"data-unitindex": unitIndex
			}
			);
		for (let c = 6; c >= 0; c -= 1)
		{
			node.appendChild(dhtml.createNode("option", "",
				{
					"value": c
				}, c.toString()));
		};
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createSpecialrulesEditorNode(unitIndex)
	{
		let node = dhtml.createNode("select", "",
			{
				"size": "1",
				"data-action": "addspecialrule",
				"data-unitindex": unitIndex
			}
			);
		for (let s = 0; s < this._specialrules.length; s += 1)
		{
			node.appendChild(dhtml.createNode("option", "",
				{
					"value": this._specialrules[s].key
				}, this._specialrules[s].text));
		};
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createSpecialruleAdditionaltextEditorNode(unitIndex, specialruleIndex)
	{
		let node = dhtml.createNode("input", "",
			{
				"maxlength": "40",
				"data-editor": "specialruletext",
				"data-unitindex": unitIndex,
				"data-specialruleIndex": specialruleIndex,
				"onmouseover": "this.focus();",
				"onmouseout": "this.blur();",
				"onclick": "event.stopPropagation();"
			}
			);
		node.onchange = this.dispatchEditorEvent;
		node.oninput = dhtml.fitInputSize;
		return node;
	};

	createWarbandHeaderNode()
	{
		let node = dhtml.createNode("div", "warbandName interactive");
		node.appendChild(dhtml.createNode("span", "",
			{
				"style": "display:inline-block;",
				"data-valueof": "warbandname"
			}
			));
		node.appendChild(this.createWarbandNameEditorNode());
		return node;
	};

	createWarbandFooterNode()
	{
		let node = dhtml.createNode("div", "",
			{
				"id": "classicview_warbandsummary_wrapper",
				"style": "height:auto;"
			}
			);
		let wrapperNode = dhtml.createNode("div", "centeredViewport",
			{
				"id": "classicview_warbandsummary"
			}
			);
		wrapperNode.appendChild(dhtml.createNode("div", "",
			{
				"data-staticvalueof": "warbandsummary"
			}, "..."));
		wrapperNode.appendChild(dhtml.createNode("div", "",
			{
				"data-staticvalueof": "rulechecks"
			}
			));
		node.appendChild(wrapperNode);
		return node;
	};

	createUnitSpecialrulesNodes(unit, unitIndex)
	{
		function specialruleHint(resources, specialruleKey)
		{
			let result = resources.defaultText(specialruleKey);
			if (resources[specialruleKey].personality === true)
			{
				result += " [personality]";
			};
			result += ",&#160;" + resources[specialruleKey].scope.toUpperCase();
			return result;
		};
		let nodes = [];
		for (let s = 0; s < unit.specialrules.length; s += 1)
		{
			let specialruleWrapper = dhtml.createNode("span", "specialruleWrapper");
			let textNode = dhtml.createNode("span", "specialrule interactive",
				{
					"data-unitindex": unitIndex,
					"data-action": "removespecialrule",
					"data-value": s
				}
				);
			let specialruleText = this.translate(unit.specialrules[s].key);
			if (unit.specialrules[s].additionalText === undefined)
			{
				textNode.appendChild(document.createTextNode(specialruleText));
			}
			else
			{
				let specialruleTextBefore = dhtml.createNode("span", "", {}, specialruleText.substring(0, specialruleText.indexOf("...")));
				let specialruleTextAfter = dhtml.createNode("span", "", {}, specialruleText.substring(specialruleText.indexOf("...") + 3));
				let additionalTextNode = dhtml.createNode("span", "",
					{
						"data-valueof": "additionaltext"
					}, unit.specialrules[s].additionalText);
				let additionalTextEditor = this.createSpecialruleAdditionaltextEditorNode(unitIndex, s);
				additionalTextEditor.value = unit.specialrules[s].additionalText;
				dhtml.fitInputSize(additionalTextEditor);
				if (specialruleTextBefore.innerText !== "")
				{
					textNode.appendChild(specialruleTextBefore);
				};
				textNode.appendChild(additionalTextNode);
				textNode.appendChild(additionalTextEditor);
				if (specialruleTextAfter.innerText !== "")
				{
					textNode.appendChild(specialruleTextAfter);
				};
			};
			textNode.appendChild(dhtml.createNode("div", "tooltip nowrap", {}, specialruleHint(this._resources, unit.specialrules[s].key)));
			if (this._settings.ruleScope.includes(this._resources[unit.specialrules[s].key].scope) === false)
			{
				textNode.classList.add("outOfScope");
			};
			textNode.onclick = this.dispatchEditorEvent;
			specialruleWrapper.appendChild(textNode);
			if (s < unit.specialrules.length - 1)
			{
				specialruleWrapper.appendChild(dhtml.createNode("span", "", {}, ",&#160;"));
			};
			nodes.push(specialruleWrapper);
		};
		return nodes;
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
