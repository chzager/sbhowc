"use strict";

var htmlForm = {};

htmlForm.init = function ()
{
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

htmlForm.unload = function()
{
	window.removeEventListener("menubox", htmlForm.menuboxEventListener);
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
	let eventOrigin = editorEvent.target;
	if (editorEvent.type === "click")
	{
		while (eventOrigin.onclick === null)
		{
			eventOrigin = eventOrigin.parentNode;
		};
	};
	let unitIndex;
	let unitNode = eventOrigin.closest("[data-unitindex]");
	if (unitNode !== null)
	{
		unitIndex = unitNode.getAttribute("data-unitindex");
	};
	let specialruleIndex;
	let specialruleNode = eventOrigin.closest("[data-specialruleindex]");
	if (specialruleNode !== null)
	{
		specialruleIndex = specialruleNode.getAttribute("data-specialruleindex");
	};
	let eventValue;
	if (eventOrigin.value !== undefined)
	{
		eventValue = eventOrigin.value;
	}
	else
	{
		eventValue = eventOrigin.innerText;
	};
	let editorEventData =
	{
		"detail":
		{
			"value": eventValue,
			"unitIndex": unitIndex,
			"specialruleIndex": specialruleIndex,
			"originalEvent": editorEvent
		}
	};
	for (let a = 0; a < eventOrigin.attributes.length; a += 1)
	{
		if (eventOrigin.attributes[a].nodeName.startsWith("data-") === true)
		{
			editorEventData.detail[eventOrigin.attributes[a].nodeName.substring(5)] = eventOrigin.attributes[a].nodeValue;
		};
	};
	window.dispatchEvent(new CustomEvent("editor", editorEventData));
};

htmlForm.refreshWarbandName = function ()
{
	let warbandName = owc.warband.name;
	let targetNode = document.getElementById("warbandheader");
	if (warbandName === "")
	{
		warbandName = ui.translate("defaultWarbandName");
	};
	targetNode.innerText = warbandName;
};

htmlForm.refreshUnit = function (unitIndex, refNode = null)
{
	if (refNode === null)
	{
		refNode = document.querySelector("[data-unitindex=\"" + unitIndex + "\"]");
	};
	let unit = owc.warband.units[unitIndex];
	refNode.querySelector("[data-editor=\"name\"]").innerText = unit.name.notEmpty(ui.translate("defaultUnitName"));
	if ((unit.isPersonality === true) && (owc.settings.options.highlightPersonalities === true))
	{
		refNode.querySelector("[data-editor=\"name\"]").classList.add("personality");
	}
	else
	{
		refNode.querySelector("[data-editor=\"name\"]").classList.remove("personality");
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
	refNode.removeAllChildred();
	let unit = owc.warband.units[unitIndex];
	let specialrulesCount = unit.specialrules.length;
	for (let s = 0; s < specialrulesCount; s += 1)
	{
		let specialruleNode;
		let specialruleText = ui.translate(unit.specialrules[s].key);
		let variables =
		{
			"index": s,
			"hint": _specialruleHint(unit.specialrules[s].key),
			"specialrule-text": specialruleText,
			"specialrule-text-before": specialruleText.substring(0, specialruleText.indexOf("...")),
			"specialrule-additional-text": unit.specialrules[s].additionalText || "",
			"specialrule-text-after": specialruleText.substring(specialruleText.indexOf("...") + 3),
			"default-additional-text": "...",
			"specialrules-count": specialrulesCount
		};
		specialruleNode = pageSnippets.produceFromSnippet("specialrule", htmlForm, variables);
		if (owc.settings.ruleScope.includes(owc.resources.data[unit.specialrules[s].key].scope) === false)
		{
			specialruleNode.classList.add("out-of-scope");
		};
		refNode.appendChild(specialruleNode);
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
	let rulesCheckResult = [];
	if (owc.settings.options.applyRuleChecks === true)
	{
		rulesCheckResult = getRulesCheckResultAsTexts(owc.warband, owc.resources, owc.settings);
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
		};
	};
	let variables =
	{
		"warband-summary": warbandSummaryText,
		"vioalated-rules-count": rulesCheckResult.length,
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
	let wrapperNode = document.querySelector("#warbandfooter");
	wrapperNode.removeAllChildred();
	wrapperNode.appendChild(pageSnippets.produceFromSnippet("warband-summary", null, variables));
};

htmlForm.makeEditable = function (refNode)
{
	refNode.setAttribute("contenteditable", "true");
	refNode.setAttribute("spellcheck", "false");
	refNode.onfocus = (focusEvent) =>
	{
		let defaulValue = focusEvent.target.getAttribute("data-defaultvalue") || "";
		let currentValue = focusEvent.target.innerText;
		if (currentValue === defaulValue)
		{
			focusEvent.target.innerText = "";
		};
	};
	refNode.onblur = (blurEvent) =>
	{
		let defaulValue = blurEvent.target.getAttribute("data-defaultvalue") || "";
		let newValue = blurEvent.target.innerText.replaceAll(/[\r\n]/, "");
		if (newValue === "")
		{
			newValue = defaulValue;
		};
		blurEvent.target.innerText = newValue;
		htmlForm.dispatchEditorEvent(blurEvent);
	};
	refNode.onkeypress = (keypressEvent) =>
	{
		if (keypressEvent.keyCode === 13)
		{
			keypressEvent.target.blur();
		};
	};
};
