"use strict";

class ClassicView extends HtmlFormsView
{
	_determinateColumnCount()
	{
		let result = 2;
		let thresholdWidth = 650;
		let currenClientWidth = Number(document.body.clientWidth);
		if (currenClientWidth <= thresholdWidth)
		{
			result = 1;
		};
		return result;
	};

	_createUnitNameCell(unitIndex, isPersonality)
	{
		let result = dhtml.createNode("th", "interactive",
			{
				"colspan": "3",
				"onmouseout": "document.activeElement.blur();"
			}
			);
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "name",
				"style": "display:inline-block; width:90%;"
			}, "n"));
		result.appendChild(this.createUnitNameEditorNode(unitIndex));
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "count",
				"style": "display:inline-block; width:10%; float:right; text-align:right;"
			}, "c"));
		result.appendChild(this.createUnitCountEditorNode(unitIndex));
		return result;
	};

	_createUnitPointsCell(unitIndex)
	{
		let result = dhtml.createNode("td", "interactive",
			{
				"style": "cursor:pointer;",
				"data-action": "showunitmenu",
				"data-unitindex": unitIndex
			}
			);
		result.appendChild(dhtml.createNode("span", "", {}, this.translate("points") + ":&#160;"));
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
		let result = dhtml.createNode("td", "interactive");
		result.appendChild(dhtml.createNode("span", "", {}, this.translate("quality") + ":&#160;"));
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "quality"
			}, "q"));
		result.appendChild(this.createUnitQualityEditorNode(unitIndex));
		return result;
	};

	_createUnitCombatscoreCell(unitIndex)
	{
		let result = dhtml.createNode("td", "interactive");
		result.appendChild(dhtml.createNode("span", "", {}, this.translate("combat") + ":&#160;"));
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "combat"
			}, "c"));
		result.appendChild(this.createUnitCombatscoreEditorNode(unitIndex));
		return result;
	};

	_createUnitSpecialrulesCell(unitIndex)
	{
		let result = dhtml.createNode("td", "interactive",
			{
				"colspan": "2"
			}
			);
		result.appendChild(dhtml.createNode("span", "",
			{
				"data-staticvalueof": "specialrules"
			}, "s"));
		result.appendChild(this.createSpecialrulesEditorNode(unitIndex));
		return result;
	};

	createAddUnitNode()
	{
		let result = dhtml.createNode("div", "addunit",
			{
				"data-action": "addunit",
			}, "Add new unit");
		result.onclick = this.dispatchEditorEvent;
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

	createUnitNode(unitIndex, isPersonality = false)
	{
		let node = dhtml.createNode("table", "unit box-shadow",
			{
				"data-unitindex": unitIndex
			}
			);
		let row = {};
		/* header */
		row = dhtml.createNode("tr");
		node.appendChild(this._createUnitNameCell(unitIndex, isPersonality));
		node.appendChild(row);
		/* line 1 */
		row = dhtml.createNode("tr");
		row.appendChild(this._createUnitPointsCell(unitIndex));
		row.appendChild(this._createUnitQualityCell(unitIndex));
		row.appendChild(this._createUnitCombatscoreCell(unitIndex));
		node.appendChild(row);
		/* line 2 */
		row = dhtml.createNode("tr");
		row.appendChild(dhtml.createNode("td", "passive", {}, this.translate("specialrules") + ":"));
		row.appendChild(this._createUnitSpecialrulesCell(unitIndex));
		node.appendChild(row)
		return node;
	};

	printWarband(warband, interactive = true)
	{
		this.warband = warband;
		let twoColumns = ((this.columnCount === 2) || (interactive === false));
		let htmlNode = dhtml.createNode("div", "classicview");
		if (interactive === true)
		{
			htmlNode.classList.add("screenfx");
		};
		htmlNode.appendChild(this.createWarbandHeaderNode());
		let unitNodes = [];
		for (let u = 0; u < warband.units.length; u += 1)
		{
			let unitNode = this.createUnitNode(u, warband.units[u].isPersonality);
			unitNodes.push(unitNode);
			this.printUnit(warband.units[u], u, unitNode);
		};
		let unitsTable = dhtml.createNode("table#unitsgrid");
		unitNodes.push(this.createAddUnitNode());
		if (twoColumns === true)
		{
			if (unitNodes.length % 2 !== 0)
			{
				unitNodes.push(dhtml.createNode("div"));
			};
			for (let p = 0; p < unitNodes.length; p += 2)
			{
				let unitsTableRow = dhtml.createNode("tr");
				let oddCol = dhtml.createNode("td", "left");
				let evenCol = dhtml.createNode("td", "right");
				oddCol.appendChild(unitNodes[p]);
				evenCol.appendChild(unitNodes[p + 1]);
				unitsTableRow.appendChild(oddCol);
				unitsTableRow.appendChild(evenCol);
				unitsTable.appendChild(unitsTableRow);
			};
		}
		else
		{
			for (let p = 0; p < unitNodes.length; p += 1)
			{
				let unitsTableRow = dhtml.createNode("tr");
				let unitsTableCol = dhtml.createNode("td");
				unitsTableCol.appendChild(unitNodes[p]);
				unitsTableRow.appendChild(unitsTableCol);
				unitsTable.appendChild(unitsTableRow);
			};
		};
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
			unitCountText = "x&#160;" + unit.count.toString();
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

	onWindowMenubox(clickEvent)
	{
		let editorEventData =
		{
			"detail":
			{
				"action": clickEvent.detail.itemKey,
				"unitindex": clickEvent.detail.context,
				"originalEvent": clickEvent
			}
		};
		window.dispatchEvent(new CustomEvent("EditorEvent", editorEventData));
	};

	onWindowResize(resizeEvent = undefined)
	{
		let setColumnCount = this._determinateColumnCount();
		if (this.columnCount !== setColumnCount)
		{
			this.columnCount = setColumnCount;
			this.printWarband(this.warband);
			this.onWindowScroll();
		};
	};

};
