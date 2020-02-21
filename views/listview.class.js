"use strict";

class ListView extends HtmlFormsView
{
	_createUnitNameCell(unitIndex, isPersonality)
	{
		let result = dhtml.createNode("td");
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "name"
			}, "n"));
		result.appendChild(this.createUnitNameEditorNode(unitIndex));
		return result;
	};
	
	_createUnitCountCell(unitIndex)
	{
		let result = dhtml.createNode("td");
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "count"
			}, "c"));
		result.appendChild(this.createUnitCountEditorNode(unitIndex));
		return result;
	};

	_createUnitPointsCell(unitIndex)
	{
		let result = dhtml.createNode("td", "points",
			{
				"data-action": "showunitmenu",
				"data-unitindex": unitIndex
			}
			);
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-staticvalueof": "points"
			}
			));
		result.onclick = this.dispatchEditorEvent;
		return result;
	};

	_createUnitQualityCell(unitIndex)
	{
		let result = dhtml.createNode("td", "quality");
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "quality"
			}, "q"));
		result.appendChild(this.createUnitQualityEditorNode(unitIndex));
		return result;
	};

	_createUnitCombatscoreCell(unitIndex)
	{
		let result = dhtml.createNode("td", "combatscore");
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "combat"
			}, "c"));
		result.appendChild(this.createUnitCombatscoreEditorNode(unitIndex));
		return result;
	};

	_createUnitSpecialrulesCell(unitIndex)
	{
		let result = dhtml.createNode("td");
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-staticvalueof": "specialrules"
			}, "s"));
		result.appendChild(this.createSpecialrulesEditorNode(unitIndex));
		return result;
	};

	createSpecialrulesNodes(unit, unitIndex)
	{
		let nodes = [];
		for (let s = 0; s < unit.specialrules.length; s += 1)
		{
			let specialruleNode = super.createSpecialruleNode(unit, unitIndex, s, super.createSpecialruleAdditionaltextEditorNode, this.dispatchEditorEvent);
			if (s < unit.specialrules.length - 1)
			{
				specialruleNode.appendChild(dhtml.createNode("span", "", {}, ",&#160;"));
			};
			nodes.push(specialruleNode);
		};
		return nodes;
	};

	createUnitsTableHeader()
	{
		let result = dhtml.createNode("tr#unitsheader");
		result.appendChild(dhtml.createNode("th#count", "", {}, this.translate("count")));
		result.appendChild(dhtml.createNode("th#name", "", {}, this.translate("name")));
		result.appendChild(dhtml.createNode("th#points", "", {}, this.translate("points")));
		result.appendChild(dhtml.createNode("th#quality", "", {}, this.translate("quality")));
		result.appendChild(dhtml.createNode("th#combat", "", {}, this.translate("combat")));
		result.appendChild(dhtml.createNode("th#specialrules", "", {}, this.translate("specialrules")));
		return result;
	};
	
	createUnitNode(unitIndex, isPersonality = false)
	{
		let result = dhtml.createNode("tr", "interactive", {"data-unitindex": unitIndex});
		result.appendChild(this._createUnitCountCell(unitIndex));
		result.appendChild(this._createUnitNameCell(unitIndex, isPersonality));
		result.appendChild(this._createUnitPointsCell(unitIndex));
		result.appendChild(this._createUnitQualityCell(unitIndex));
		result.appendChild(this._createUnitCombatscoreCell(unitIndex));
		result.appendChild(this._createUnitSpecialrulesCell(unitIndex));
		return result;
	};

	createAddUnitNode()
	{
		let result = dhtml.createNode("tr", "addunit");
		let cellNode = dhtml.createNode("td", "", {"colspan": "6"});
		let divNode = dhtml.createNode("div", "addunit",
			{
				"data-action": "addunit",
			}, "Add new unit");
		divNode.onclick = this.dispatchEditorEvent;
		cellNode.appendChild(divNode);
		result.appendChild(cellNode);
		return result;
	};

	printWarband(warband, interactive = true)
	{
		this.warband = warband;
		let htmlNode = dhtml.createNode("div", "listview");
		if (interactive === true)
		{
			htmlNode.classList.add("screenfx");
		};
		htmlNode.appendChild(this.createWarbandHeaderNode());
		let unitsTable = dhtml.createNode("table#units");
		unitsTable.appendChild(this.createUnitsTableHeader());
		for (let u = 0; u < warband.units.length; u += 1)
		{
			let unitNode = this.createUnitNode(u, warband.units[u].isPersonality);
			this.printUnit(warband.units[u], u, unitNode);
			unitsTable.appendChild(unitNode);
		};
		unitsTable.appendChild(this.createAddUnitNode());
		htmlNode.appendChild(unitsTable);
		htmlNode.appendChild(this.createWarbandFooterNode());
		dhtml.clearNode(this.html);
		super.printWarbandName(warband, htmlNode);
		super.printWarbandSummary(warband, htmlNode);
		if (interactive === false)
		{
			dhtml.removeNodesByQuerySelectors(["select", "[data-editor]", ".specialruleEditorSeparator", ".addunit"], htmlNode);
			dhtml.removeClasses(["interactive", "screenfx", "out-of-scope"], htmlNode);
		};
		this.html.appendChild(htmlNode);
	};

	printUnit(unit, unitIndex, targetNode = undefined)
	{
		if (targetNode === undefined)
		{
			targetNode = document.querySelector("[data-unitindex='" + unitIndex + "']");
		};

		let unitName = unit.name;
		targetNode.querySelector("[data-valueof='name']").innerText = unitName.notEmpty(this.translate("defaultUnitName"));
		targetNode.querySelector("[data-editor='name']").value = unit.name;
		if ((unit.isPersonality === true) && (this.settings.options.highlightPersonalities === true))
		{
			targetNode.querySelector("[data-valueof='name']").classList.add("personality");
		}
		else
		{
			targetNode.querySelector("[data-valueof='name']").classList.remove("personality");
		};
		let unitCountText = "&#160;";
		if (unit.count > 1)
		{
			unitCountText = unit.count.toString() + "&#160;x";
		};
		targetNode.querySelector("[data-valueof='count']").innerHTML = unitCountText;
		targetNode.querySelector("[data-editor='count']").value = unit.count;
		targetNode.querySelector("[data-staticvalueof='points']").innerText = unit.points;
		targetNode.querySelector("[data-valueof='quality']").innerText = String(unit.quality) + "+";
		targetNode.querySelector("[data-editor='quality']").value = unit.quality;
		targetNode.querySelector("[data-valueof='combat']").innerText = unit.combat;
		targetNode.querySelector("[data-editor='combat']").value = unit.combat;
		let specialrulesNode = targetNode.querySelector("[data-staticvalueof='specialrules']");
		dhtml.clearNode(specialrulesNode);
		let specialruleNodes = this.createSpecialrulesNodes(unit, unitIndex);
		if (specialruleNodes.length > 0)
		{
			for (let n = 0; n < specialruleNodes.length; n += 1)
			{
				specialrulesNode.appendChild(specialruleNodes[n]);
			};
			specialrulesNode.appendChild(dhtml.createNode("span", "specialruleEditorSeparator", {}, ",&#160;"));
		};
	};

};
