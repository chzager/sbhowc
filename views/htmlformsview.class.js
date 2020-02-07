"use strict";

class HtmlFormsView extends AbstractView
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
		this.warband = {};
		window.addEventListener(Menubox.name, this.unitMenuClick);
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
		window.dispatchEvent(new CustomEvent("editor", editorEventData));
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
		for (let s = 0; s < this.specialrulesList.length; s += 1)
		{
			node.appendChild(dhtml.createNode("option", "",
				{
					"value": this.specialrulesList[s].key
				}, this.specialrulesList[s].text));
		};
		node.onchange = this.dispatchEditorEvent;
		return node;
	};

	createSpecialruleAdditionaltextEditorNode(unitIndex, specialruleIndex, additionalText, eventDispatcher)
	{
		let node = dhtml.createNode("input", "",
			{
				"maxlength": "40",
				"data-editor": "specialruletext",
				"data-unitindex": unitIndex,
				"data-specialruleIndex": specialruleIndex,
				"data-spaceafter": "1em",
				"onmouseover": "this.focus();",
				"onmouseout": "this.blur();",
				"onclick": "event.stopPropagation();"
			}
			);
		node.value = additionalText;
		node.onchange = eventDispatcher;
		node.oninput = dhtml.fitInputSize;
		dhtml.fitInputSize(node);
		return node;
	};

	createSpecialruleNode(unit, unitIndex, specialruleIndex, additionalTextEditorCreator, eventDispatcher)
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
		let result = dhtml.createNode("span", "specialrule-wrapper");
		let textNode = dhtml.createNode("span", "specialrule interactive",
			{
				"data-unitindex": unitIndex,
				"data-action": "removespecialrule",
				"data-value": specialruleIndex
			}
			);
		let specialruleText = this.translate(unit.specialrules[specialruleIndex].key);
		if (unit.specialrules[specialruleIndex].additionalText === undefined)
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
				}, unit.specialrules[specialruleIndex].additionalText);
			if (specialruleTextBefore.innerText !== "")
			{
				textNode.appendChild(specialruleTextBefore);
			};
			textNode.appendChild(additionalTextNode);
			if (typeof additionalTextEditorCreator === "function")
			{
				let additionalTextEditor = additionalTextEditorCreator(unitIndex, specialruleIndex, unit.specialrules[specialruleIndex].additionalText, eventDispatcher);
				textNode.appendChild(additionalTextEditor);
			};
			if (specialruleTextAfter.innerText !== "")
			{
				textNode.appendChild(specialruleTextAfter);
			};
		};
		textNode.appendChild(dhtml.createNode("div", "tooltip nowrap", {}, specialruleHint(this.resources, unit.specialrules[specialruleIndex].key)));
		if (this.settings.ruleScope.includes(this.resources[unit.specialrules[specialruleIndex].key].scope) === false)
		{
			textNode.classList.add("out-of-scope");
		};
		textNode.onclick = this.dispatchEditorEvent;
		result.appendChild(textNode);
		return result;
	};

	createWarbandHeaderNode()
	{
		let node = dhtml.createNode("div#warbandheader", "interactive");
		node.appendChild(dhtml.createNode("span", "",
			{
				"data-valueof": "warbandname"
			}
			));
		node.appendChild(this.createWarbandNameEditorNode());
		return node;
	};

	createWarbandFooterNode()
	{
		let node = dhtml.createNode("div#warbandfooter", "",
			{
				"style": "height: auto;"
			}
			);
		let wrapperNode = dhtml.createNode("div#warbandsummary-wrapper", "centeredViewport");
		node.appendChild(wrapperNode);
		return node;
	};

	printWarbandName(warband, targetNode = document.body)
	{
		let warbandName = warband.name;
		if (warbandName === "")
		{
			warbandName = this.translate("defaultWarbandName");
		};
		targetNode.querySelector("[data-valueof='warbandname']").innerText = warbandName;
		targetNode.querySelector("[data-editor='warbandname']").value = warband.name;
	};

	printWarbandSummary(warband, targetNode = document.body)
	{
		let wrapperNode = targetNode.querySelector("#warbandsummary-wrapper");
		dhtml.clearNode(wrapperNode);
		let warbandSummaryText = this.translate("totalPoints",
			{
				"F": warband.figureCount,
				"P": warband.points
			}
			);
		if (warband.personalityPoints > 0)
		{
			if (this.settings.options.personalitiesInPoints === true)
			{
				warbandSummaryText += " (" + this.translate("personalitiesPoints",
				{
					"Q": warband.personalityPoints
				}
				) + ")";
			}
			else
			{
				warbandSummaryText += " (" + this.translate("personalitiesPercent",
				{
					"P": Math.floor(warband.personalityPoints / warband.points * 100)
				}
				) + ")";
			};
		};
		let warbandSummaryNode = dhtml.createNode("p", "", {}, warbandSummaryText);
		wrapperNode.appendChild(warbandSummaryNode);
		if (this.settings.options.applyRuleChecks === true)
		{
			let rulesCheckResult = getRulesCheckResultAsTexts(warband, this.resources, this.settings);
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

	onWindowScroll(scrollEvent = undefined)
	{
		let warbandSummaryWarpperNode = document.getElementById("warbandfooter");
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
			};
		};
	};

};
