"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var formsCore = {};

formsCore.init = function ()
{
	formsCore.editors = {};
	let variables =
	{
		"quality-values": owc.editor.qualityValues,
		"combat-values": owc.editor.combatValues,
		"specialrules-list": []
	};
	variables["specialrules-list"].push(
	{
		"key": "",
		"text": owc.helper.translate("addSpecialrule")
	}
	);
	for (let specialrule of owc.editor.specialrulesList)
	{
		variables["specialrules-list"].push(
		{
			"key": specialrule.key,
			"text": specialrule.text
		}
		);
	};
	formsCore.editors.qualitySelector = pageSnippets.produce("quality-selector", formsCore, variables);
	formsCore.editors.combatSelector = pageSnippets.produce("combat-selector", formsCore, variables);
	formsCore.editors.specialrulesSelector = pageSnippets.produce("specialrules-selector", formsCore, variables);
	formsCore.unitMenu = new Menubox("unitMenu",
	{
		"duplicate": "Duplicate unit",
		"copy": "Copy unit",
		"remove": "Remove unit",
		"x1": null,
		"moveup": "Move unit up",
		"movedown": "Move unit down"
	}
		);
	if (owc.ui.isPrinting === false)
	{
		window.addEventListener("focus", formsCore.onWindowFocus);
		window.addEventListener("menubox", formsCore.onMenuboxEvent);
	};
};

formsCore.unload = function (menuboxEvent)
{
	window.removeEventListener("focus", formsCore.onWindowFocus);
	window.removeEventListener("menubox", formsCore.onMenuboxEvent);
};

formsCore.onWindowFocus = function (focusEvent)
{
	owc.editor.manangeUnitClipboard();
};

formsCore.onMenuboxEvent = function (menuboxEvent)
{
	let editorEventData =
	{
		"detail":
		{
			"action": menuboxEvent.detail.itemKey,
			"unitIndex": Number(menuboxEvent.detail.context),
			"originalEvent": menuboxEvent
		}
	};
	window.dispatchEvent(new CustomEvent("editor", editorEventData));
};

formsCore.onValueEdited = (anyEvent) => formsCore.dispatchEditorEvent(anyEvent);

formsCore.appendQualitySelector = function (refNode)
{
	let selectorNode = formsCore.editors.qualitySelector.cloneNode(true);
	selectorNode.onchange = formsCore.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

formsCore.appendCombatSelector = function (refNode)
{
	let selectorNode = formsCore.editors.combatSelector.cloneNode(true);
	selectorNode.onchange = formsCore.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

formsCore.appendSpecialrulesSelector = function (refNode)
{
	let selectorNode = formsCore.editors.specialrulesSelector.cloneNode(true);
	selectorNode.onchange = formsCore.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

formsCore.dispatchEditorEvent = function (editorEvent)
{
	let eventOrigin = editorEvent.target;
	if (editorEvent.type === "click")
	{
		while (eventOrigin.onclick === null)
		{
			eventOrigin = eventOrigin.parentNode;
		};
	};
	let unitNode = eventOrigin.closest("[data-unitindex]");
	let unitIndex = (unitNode !== null) ? Number(unitNode.getAttribute("data-unitindex")) : null;
	let specialruleNode = eventOrigin.closest("[data-specialruleindex]");
	let specialruleIndex = (specialruleNode !== null) ? Number(specialruleNode.getAttribute("data-specialruleindex")) : null;
	let eventValue = (eventOrigin.value !== undefined) ? eventOrigin.value : eventOrigin.innerText;
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
	for (let attribute of eventOrigin.attributes)
	{
		if (attribute.nodeName.startsWith("data-"))
		{
			editorEventData.detail[attribute.nodeName.substring(5)] = attribute.nodeValue;
		};
	};
	window.dispatchEvent(new CustomEvent("editor", editorEventData));
};

formsCore.refreshWarbandName = function ()
{
	document.getElementById("warbandheader").innerText = owc.helper.nonBlankWarbandName();
};

formsCore.refreshUnit = function (unitIndex, refNode = null)
{
	if (refNode === null)
	{
		refNode = document.querySelector("[data-unitindex=\"" + unitIndex + "\"]");
	};
	let unit = owc.warband.units[unitIndex];
	refNode.querySelector("[data-editor=\"name\"]").innerText = owc.helper.nonBlankUnitName(unit);
	if ((unit.isPersonality) && (owc.settings.options.highlightPersonalities))
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
	formsCore.refreshSpecialrules(unitIndex, refNode.querySelector("[data-staticvalueof=\"specialrules\"]"));
};

formsCore.refreshSpecialrules = function (unitIndex, refNode)
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
	refNode.removeAllChildren();
	let unit = owc.warband.units[unitIndex];
	let specialrulesCount = unit.specialrules.length;
	for (let s = 0; s < specialrulesCount; s += 1)
	{
		let spcialrule = unit.specialrules[s];
		let specialruleNode;
		let specialruleText = owc.helper.translate(spcialrule.key);
		let variables =
		{
			"index": s,
			"hint": _specialruleHint(spcialrule.key),
			"specialrule-text": specialruleText,
			"specialrule-text-before": specialruleText.substring(0, specialruleText.indexOf("...")),
			"specialrule-additional-text": spcialrule.additionalText || "",
			"specialrule-text-after": specialruleText.substring(specialruleText.indexOf("...") + 3),
			"default-additional-text": "...",
			"specialrules-count": specialrulesCount
		};
		specialruleNode = pageSnippets.produce("specialrule", formsCore, variables);
		if (owc.settings.ruleScope.includes(owc.resources.data[spcialrule.key].scope) === false)
		{
			specialruleNode.children[0].classList.add("out-of-scope");
		};
		refNode.appendChild(specialruleNode);
	};
};

formsCore.refreshWarbandSummary = function ()
{
	let warbandSummaryText = owc.helper.translate("totalPoints",
	{
		"F": owc.warband.figureCount,
		"P": owc.warband.points
	}
		);
	if (owc.warband.personalityPoints > 0)
	{
		if (owc.settings.options.personalitiesInPoints)
		{
			warbandSummaryText += " (" + owc.helper.translate("personalitiesPoints",
			{
				"Q": owc.warband.personalityPoints
			}
			) + ")";
		}
		else
		{
			warbandSummaryText += " (" + owc.helper.translate("personalitiesPercent",
			{
				"P": Math.floor(owc.warband.personalityPoints / owc.warband.points * 100)
			}
			) + ")";
		};
	};
	let variables =
	{
		"warband-summary": warbandSummaryText,
		"rule-violations": []
	};
	if (owc.settings.options.applyRuleChecks)
	{
		for (let rulecheckResult of owc.rulecheck.checkAll())
		{
			variables["rule-violations"].push(
			{
				"text": owc.rulecheck.getText(rulecheckResult)
			}
			);
		};
	};
	let wrapperNode = document.querySelector("#warbandfooter");
	wrapperNode.removeAllChildren();
	wrapperNode.appendChild(pageSnippets.produce("warband-summary", null, variables));
};

formsCore.refreshPasteUnitButton = function (clipboardData)
{
	let addunitContainer = document.querySelector("#additmes-container");
	let pasteUnitNode = addunitContainer.querySelector("[data-action=\"pasteunit\"]");
	if (pasteUnitNode !== null)
	{
		pasteUnitNode.remove();
	};
	if (clipboardData !== null)
	{
		let variables =
		{
			"paste-unit": owc.helper.translate("pasteUnit",
			{
				"UNIT": clipboardData.title
			}
			),
			"unit-name": clipboardData.title,
			"unit-code": clipboardData.data
		};
		pasteUnitNode = pageSnippets.produce("paste-unit", formsCore, variables);
		addunitContainer.appendChild(pasteUnitNode);
	};
};

formsCore.makeEditable = function (refNode)
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
		let newValue = blurEvent.target.innerText.replace(/[\r\n]/g, "");
		blurEvent.target.innerText = newValue;
		// blurEvent.target.innerText = (newValue !== "") ? newValue : defaulValue;
		formsCore.dispatchEditorEvent(blurEvent);
	};
	refNode.onkeypress = (keypressEvent) =>
	{
		if (keypressEvent.keyCode === 13)
		{
			keypressEvent.target.blur();
		};
	};
};
