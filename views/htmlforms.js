"use strict";

var htmlForm = {};

htmlForm.init = function ()
{
	console.log("htmlForm.init()");
	htmlForm.editors = {};
	let variables =
	{
		"quality-values": [],
		"combat-values": [],
		"specialrules-list": []
	};
	for (let q = 2; q <= 6; q += 1)
	{
		variables["quality-values"].push(
		{
			"value": q,
			"text": q.toString() + "+"
		}
		);
	};
	for (let c = 6; c >= 0; c -= 1)
	{
		variables["combat-values"].push(
		{
			"value": c
		}
		);
	};
	variables["specialrules-list"].push(
	{
		"key": "",
		"text": ui.translate("addSpecialrule")
	}
	);
	for (let s = 0; s < editor.specialrulesList.length; s += 1)
	{
		variables["specialrules-list"].push(
		{
			"key": editor.specialrulesList[s].key,
			"text": editor.specialrulesList[s].text
		}
		);
	};
	htmlForm.editors.qualitySelector = pageSnippets.produceFromSnippet("quality-selector", htmlForm, variables);
	htmlForm.editors.combatSelector = pageSnippets.produceFromSnippet("combat-selector", htmlForm, variables);
	htmlForm.editors.specialrulesSelector = pageSnippets.produceFromSnippet("specialrules-selector", htmlForm, variables);

	htmlForm.unitMenu = new Menubox("unitMenu",
	{
		"duplicate": "Duplicate unit",
		"copy": "Copy unit",
		"remove": "Remove unit",
		"x1": null,
		"moveup": "Move unit up",
		"movedown": "Move unit down"
	}
		);
	window.addEventListener("menubox", htmlForm.menuboxEventListener);
};

htmlForm.appendQualitySelector = function (refNode)
{
	let selectorNode = htmlForm.editors.qualitySelector.cloneNode(true);
	selectorNode.onchange = htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

htmlForm.appendCombatSelector = function (refNode)
{
	let selectorNode = htmlForm.editors.combatSelector.cloneNode(true);
	selectorNode.onchange = htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

htmlForm.appendSpecialrulesSelector = function (refNode)
{
	let selectorNode = htmlForm.editors.specialrulesSelector.cloneNode(true);
	selectorNode.onchange = htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

htmlForm.menuboxEventListener = function (menuboxEvent)
{
	console.log("htmlForm.menuboxEventListener()", menuboxEvent);
	let editorEventData =
	{
		"detail":
		{
			"action": menuboxEvent.detail.itemKey,
			"unitIndex": menuboxEvent.detail.context,
			"originalEvent": menuboxEvent
		}
	};
	window.dispatchEvent(new CustomEvent("editor", editorEventData));
};

htmlForm.dispatchEditorEvent = function (editorEvent)
{
	console.log("htmlForm.dispatchEditorEvent", editorEvent);
	let unitIndex = htmlForm.getUnitIndex(editorEvent.target);
	let eventSender = editorEvent.target;
	if (editorEvent.type === "click")
	{
		console.log(eventSender.outerHTML, eventSender.onclick);
		while (eventSender.onclick === null)
		{
			eventSender = eventSender.parentNode;
		};
		console.log(eventSender.outerHTML);
	};
	let editorEventData =
	{
		"detail":
		{
			"value": eventSender.value,
			"unitIndex": unitIndex,
			"originalEvent": editorEvent
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

htmlForm.getUnitIndex = function (refNode)
{
	let result;
	let unitIndex = refNode.getAttribute("data-unitindex");
	if (unitIndex !== null)
	{
		result = unitIndex;
	}
	else if (refNode.parentElement !== null)
	{
		result = htmlForm.getUnitIndex(refNode.parentElement);
	};
	return result;
};

htmlForm.refreshWarbandName = function ()
{
	let warbandName = owc.warband.name;
	let targetNode = document.getElementById("warbandheader");
	if (warbandName === "")
	{
		warbandName = ui.translate("defaultWarbandName");
	};
	targetNode.querySelector("[data-valueof=\"warbandname\"]").innerText = warbandName;
	targetNode.querySelector("[data-editor=\"warbandname\"]").value = owc.warband.name;
};

htmlForm.refreshUnit = function (unitIndex, refNode = null)
{
	console.log("htmlForm.refreshUnit()", unitIndex, refNode);
	if (refNode === null)
	{
		refNode = document.querySelector("[data-unitindex=\"" + unitIndex + "\"]");
	};
	let unit = owc.warband.units[unitIndex];
	let unitName = unit.name;
	refNode.querySelector("[data-valueof=\"name\"]").innerText = unitName.notEmpty(ui.translate("defaultUnitName"));
	refNode.querySelector("[data-editor=\"name\"]").value = unit.name;
	if ((unit.isPersonality === true) && (owc.settings.options.highlightPersonalities === true))
	{
		refNode.querySelector("[data-valueof=\"name\"]").classList.add("personality");
	}
	else
	{
		refNode.querySelector("[data-valueof=\"name\"]").classList.remove("personality");
	};
	let unitCountText = "&#160;";
	if (unit.count > 1)
	{
		unitCountText = unit.count.toString() + "&#160;x";
	};
	refNode.querySelector("[data-valueof=\"count\"]").innerHTML = unitCountText;
	refNode.querySelector("[data-editor=\"count\"]").value = unit.count;
	refNode.querySelector("[data-staticvalueof=\"points\"]").innerText = unit.points;
	refNode.querySelector("[data-valueof=\"quality\"]").innerText = String(unit.quality) + "+";
	refNode.querySelector("[data-editor=\"quality\"]").value = unit.quality;
	refNode.querySelector("[data-valueof=\"combat\"]").innerText = unit.combat;
	refNode.querySelector("[data-editor=\"combat\"]").value = unit.combat;
	htmlForm.refreshSpecialrules(unitIndex, refNode.querySelector("[data-staticvalueof=\"specialrules\"]"));
};

htmlForm.refreshSpecialrules = function (unitIndex, refNode)
{
	function _specialruleHint(specialruleKey)
	{
		let result = owc.resources.defaultText(specialruleKey);
		if (owc.resources.data[specialruleKey].personality === true)
		{
			result += "\u00A0[personality]";
		};
		result += ",\u00A0" + owc.resources.data[specialruleKey].scope.toUpperCase();
		return result;
	};
	console.log("htmlForm.refreshSpecialrules", unitIndex, refNode);
	// console.trace();
	refNode.removeAllChildred();
	let unit = owc.warband.units[unitIndex];
	for (let s = 0; s < unit.specialrules.length; s += 1)
	{
		let specialruleNode;
		let specialruleText = ui.translate(unit.specialrules[s].key);
		let variables =
		{
			"index": s,
			"hint": _specialruleHint(unit.specialrules[s].key),
			"specialrule-text": specialruleText,
			"specialrule-text-before": specialruleText.substring(0, specialruleText.indexOf("...")),
			"specialrule-additional-text": unit.specialrules[s].additionalText,
			"specialrule-text-after": specialruleText.substring(specialruleText.indexOf("...") + 3)
		};
		if (unit.specialrules[s].additionalText === undefined)
		{
			specialruleNode = pageSnippets.produceFromSnippet("simple-specialrule", htmlForm, variables);
		}
		else
		{
			specialruleNode = pageSnippets.produceFromSnippet("complex-specialrule", htmlForm, variables);
			let specialruleAdditionalTextEditor = specialruleNode.querySelector("input");
			specialruleAdditionalTextEditor.oninput = dhtml.fitInputSize;
			specialruleAdditionalTextEditor.onclick = (evt) =>
			{
				evt.stopPropagation();
			};
			dhtml.fitInputSize(specialruleAdditionalTextEditor);
		};
		if (owc.settings.ruleScope.includes(owc.resources.data[unit.specialrules[s].key].scope) === false)
		{
			specialruleNode.classList.add("out-of-scope");
		};
		refNode.appendChild(specialruleNode);
		if (s < unit.specialrules.length - 1)
		{
			refNode.appendChild(dhtml.createNode("span", "", {}, ",\u00A0"));
		};
	};
};

htmlForm.refreshWarbandSummary = function ()
{
	let warbandSummaryText = ui.translate("totalPoints",
	{
		"F": owc.warband.figureCount,
		"P": owc.warband.points
	}
		);
	if (owc.warband.personalityPoints > 0)
	{
		if (owc.settings.options.personalitiesInPoints === true)
		{
			warbandSummaryText += " (" + ui.translate("personalitiesPoints",
			{
				"Q": owc.warband.personalityPoints
			}
			) + ")";
		}
		else
		{
			warbandSummaryText += " (" + ui.translate("personalitiesPercent",
			{
				"P": Math.floor(owc.warband.personalityPoints / owc.warband.points * 100)
			}
			) + ")";
		};
	};
	let variables =
	{
		"warband-summary": warbandSummaryText
	};
	console.log(variables, warbandSummaryText);
	let wrapperNode = document.querySelector("#warbandfooter");
	wrapperNode.removeAllChildred();
	wrapperNode.appendChild(pageSnippets.produceFromSnippet("warband-summary", null, variables));
	if (owc.settings.options.applyRuleChecks === true)
	{
		let ruleViolationsHtml = htmlForm.getRuleViolatonHtml();
		if (ruleViolationsHtml !== null)
		{
			wrapperNode.appendChild(ruleViolationsHtml);
		};
	};
};

htmlForm.getRuleViolatonHtml = function ()
{
	let result = null;
	let rulesCheckResult = getRulesCheckResultAsTexts(owc.warband, owc.resources, owc.settings);
	if (rulesCheckResult.length > 0)
	{
		let variables =
		{
			"rules-violations": ui.translate("ruleViolation"),
			"rule-violations": []
		};
		for (let v = 0; v < rulesCheckResult.length; v += 1)
		{
			variables["rule-violations"].push(
			{
				"text": rulesCheckResult[v]
			}
			);
		};
		console.log(rulesCheckResult, variables);
		result = pageSnippets.produceFromSnippet("rulescheck", htmlForm, variables);
		console.log("result:", result.outerHTML);
	};
	return result;
};
