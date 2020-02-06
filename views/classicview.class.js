"use strict";

class ClassicView extends AbstractView
{
	constructor(settings, warbandCreatorResources, printToNode)
	{
		super(settings, warbandCreatorResources, printToNode);
		this.unitMenu = new Menubox("unitMenu",
			{
				"duplicate": "Duplicate unit",
				"copy": "Copy unit",
				"remove": "Remove unit",
				"x1": null,
				"moveup": "Move unit up",
				"movedown": "Move unit down"
			}
			);
		this.columnCount = this._determinateColumnCount();
		this._warband = {};
		window.addEventListener(Menubox.name, this.unitMenuClick);
	};

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

	dispatchEditorEvent(fromEvent)
	{
		let eventSender = fromEvent.target;
		if (fromEvent.type === "click")
		{
			while (eventSender.onclick === null)
			{
				eventSender = eventSender.parentNode;
			};
		};
		let editorEventData =
		{
			"detail":
			{
				"value": eventSender.value,
				"originalEvent": fromEvent
			}
		};
		for (let a = 0; a < eventSender.attributes.length; a += 1)
		{
			if (eventSender.attributes[a].nodeName.startsWith("data-") === true)
			{
				editorEventData.detail[eventSender.attributes[a].nodeName.substring(5)] = eventSender.attributes[a].nodeValue;
			};
		};
		window.dispatchEvent(new CustomEvent("EditorEvent", editorEventData));
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
		let result = dhtml.createNode("div", "addunit", {
			"data-action": "addunit",
		}, "Add new unit");
		result.onclick = this.dispatchEditorEvent;
		return result;
	};
	
	createWarbandHeaderNode()
	{
		let node = super.createWarbandHeaderNode();
		node.classList.add("interactive");
		node.classList.add("text-shadow");
		return node;
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
		this._warband = warband;
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
		let unitsTable = dhtml.createNode("table", "unitsgrid");
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
		this.printWarbandName(warband, htmlNode);
		this.printWarbandSummary(warband, htmlNode);
		if (interactive === false)
		{
			dhtml.removeNodesByQuerySelectors(["select", "[data-editor]", ".specialruleEditorSeparator", ".addunit"], htmlNode);
			dhtml.removeClasses(["interactive", "screenfx", "out-of-scope"], htmlNode);
		};
		this.html.appendChild(htmlNode);
	};

	printUnit(unit, unitIndex, targetNode = undefined)
	{
		let unitName = unit.name;
		if (targetNode === undefined)
		{
			targetNode = document.querySelector("[data-unitindex='" + unitIndex + "']");
		};
		if (unitName === "")
		{
			unitName = this.translate("defaultUnitName");
		};
		targetNode.querySelector("[data-valueof='name']").innerText = unitName;
		targetNode.querySelector("[data-editor='name']").value = unit.name;
		if ((unit.isPersonality === true) && (this._settings.options.highlightPersonalities === true))
		{
			targetNode.querySelector("[data-valueof='name']").classList.add("personality");
		}
		else
		{
			targetNode.querySelector("[data-valueof='name']").classList.remove("personality");
		};

		let unitCountText = "&#160;"
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
		let specialruleNodes = this.createUnitSpecialrulesNodes(unit, unitIndex);
		if (specialruleNodes.length > 0)
		{
			for (let n = 0; n < specialruleNodes.length; n += 1)
			{
				specialrulesNode.appendChild(specialruleNodes[n]);
			};
			specialrulesNode.appendChild(dhtml.createNode("span", "specialruleEditorSeparator", {}, ",&#160;"));
		};
	};

	printWarbandName(warband, targetNode = this.html)
	{
		let warbandName = warband.name;
		if (warbandName === "")
		{
			warbandName = this.translate("defaultWarbandName");
		};
		targetNode.querySelector("[data-valueof='warbandname']").innerText = warbandName;
		targetNode.querySelector("[data-editor='warbandname']").value = warband.name;
	};

	printWarbandSummary(warband, targetNode = this.html)
	{
		let wrapperNode = targetNode.querySelector("[data-staticvalueof='warbandsummary']");
		dhtml.clearNode(wrapperNode);
		let warbandSummary = this.translate("totalPoints",
			{
				"F": warband.figureCount,
				"P": warband.points
			}
			);
		if (warband.personalityPoints > 0)
		{
			if (this._settings.options.personalitiesInPoints === true)
			{
				warbandSummary += " (" + this.translate("personalitiesPoints",
				{
					"Q": warband.personalityPoints
				}
				) + ")";
			}
			else
			{
				warbandSummary += " (" + this.translate("personalitiesPercent",
				{
					"P": Math.floor(warband.personalityPoints / warband.points * 100)
				}
				) + ")";
			};
		};
		let warbandSummaryNode = dhtml.createNode("div", "", {}, warbandSummary);
		wrapperNode.appendChild(warbandSummaryNode);
		if (this._settings.options.applyRuleChecks === true)
		{
			let rulesCheckResult = getRulesCheckResultAsTexts(warband, this._resources, this._settings);
			if (rulesCheckResult.length > 0)
			{
				let rulesViolationNode = dhtml.createNode("p", "rulecheck-header", {}, this.translate("ruleViolation"));
				let violationList = dhtml.createNode("ul", "rulecheck-list");
				for (let v = 0; v < rulesCheckResult.length; v += 1)
				{
					violationList.appendChild(dhtml.createNode("li", "", {}, rulesCheckResult[v]));
				};
				wrapperNode.appendChild(rulesViolationNode);
				wrapperNode.appendChild(violationList);
			};
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
			this.printWarband(this._warband);
			this.onWindowScroll();
		};
	};

	onWindowScroll(scrollEvent = undefined)
	{
		// let warbandSummaryWarpperNode = document.getElementById("classicview_warbandsummary_wrapper");
		let warbandSummaryWarpperNode = document.querySelector(".warbandsummary_wrapper");
		// let warbandSummaryNode = document.getElementById("classicview_warbandsummary");
		let warbandSummaryNode = warbandSummaryWarpperNode.childNodes[0];
		{
			if (warbandSummaryWarpperNode.offsetTop - window.innerHeight - window.pageYOffset + warbandSummaryNode.clientHeight > 0)
			{
				warbandSummaryNode.classList.add("stay-at-bottom");
				warbandSummaryWarpperNode.style.height = warbandSummaryNode.clientHeight + "px";
			}
			else
			{
				warbandSummaryNode.classList.remove("stay-at-bottom");
				warbandSummaryWarpperNode.style.height = "auto";
			}
		};
	};
};
