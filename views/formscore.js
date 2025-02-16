"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/chzager/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var formsCore = {};

formsCore.init = function (pageSnippetGroup)
{
	function _appendOptionElements (selectElement, array)
	{
		for (let item of array)
		{
			selectElement.appendChild(htmlBuilder.newElement("option",
				{
					value: item.key
				}, item.label));
		};
	};
	formsCore.pageSnippetGroup = pageSnippetGroup;
	formsCore.editors =
	{
		qualitySelector: htmlBuilder.newElement("select[size='1'][data-editor='quality'][data-type='number']"),
		combatSelector: htmlBuilder.newElement("select[size='1'][data-editor='combat'][data-type='number']"),
		specialrulesSelector: htmlBuilder.newElement("select[size='1'][data-action='addspecialrule']")
	};
	_appendOptionElements(formsCore.editors.qualitySelector, owc.editor.qualityValues);
	_appendOptionElements(formsCore.editors.combatSelector, owc.editor.combatValues);
	formsCore.editors.specialrulesSelector.appendChild(htmlBuilder.newElement("option[value='']", owc.helper.translate("addSpecialrule")));
	for (let specialrule of owc.editor.specialrulesList)
	{
		formsCore.editors.specialrulesSelector.appendChild(htmlBuilder.newElement("option[value='" + specialrule.key + "']", specialrule.text));
	};
	formsCore.unitMenu = new Menubox("unitMenu",
		{
			duplicate: "Duplicate unit",
			copy: "Copy unit",
			remove: "Remove unit",
			x1: null,
			moveup: "Move unit up",
			movedown: "Move unit down"
		}, formsCore.onUnitmenuEvent
	);
};

formsCore.onUnitmenuEvent = function (data)
{
	window.dispatchEvent(new CustomEvent("editor",
		{
			detail:
			{
				action: data.itemKey,
				unitIndex: data.context,
				originalEvent: data.originalEvent
			}
		}
	));
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
	switch (eventOrigin.getAttribute("data-type"))
	{
		case "number":
			eventValue = Number(/\d+/.exec(eventValue));
			break;
	};
	let editorEventData =
	{
		detail:
		{
			value: eventValue,
			unitIndex: unitIndex,
			specialruleIndex: specialruleIndex,
			originalEvent: editorEvent
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
	function _specialruleHint (specialruleKey)
	{
		let result = owc.resources.defaultText(specialruleKey);
		if (owc.resources.data[specialruleKey].personality === true)
		{
			result += "\u00A0[personality]";
		};
		result += ",\u00A0" + owc.resources.data[specialruleKey].scope.toUpperCase();
		return result;
	};
	htmlBuilder.removeAllChildren(refNode);
	let unit = owc.warband.units[unitIndex];
	let specialrulesCount = unit.specialrules.length;
	let variables =
	{
		'is-printing': owc.isPrinting,
		specialrules: []
	};
	for (let s = 0; s < specialrulesCount; s += 1)
	{
		let specialrule = unit.specialrules[s];
		let specialruleNode;
		let specialruleText = owc.helper.translate(specialrule.key);
		let item =
		{
			index: s,
			hint: _specialruleHint(specialrule.key),
			'specialrule-text': specialruleText,
			'specialrule-text-before': specialruleText.substring(0, specialruleText.indexOf("...")),
			'specialrule-additional-text': specialrule.additionalText ?? "",
			'specialrule-text-after': specialruleText.substring(specialruleText.indexOf("...") + 3),
			'default-additional-text': "...",
			'scope-class': ((owc.settings.ruleScope.includes(owc.resources.data[specialrule.key].scope)) ? "" : "out-of-scope")
		};
		variables.specialrules.push(item);
	};
	let specialruleNode = pageSnippets[formsCore.pageSnippetGroup]["specialrules"].produce(formsCore, variables);
	refNode.appendChild(specialruleNode);
};

formsCore.refreshWarbandSummary = function ()
{
	const resources = ["total", "totalPoints", "totalFigures", (owc.settings.options.personalitiesInPoints) ? "personalitiesPoints" : "personalitiesPercent"];
	let variables =
	{
		TOTAL: owc.warband.points,
		COUNT: owc.warband.figureCount,
		POINTS: owc.warband.figurePoints,
		PERSONALITYPOINTS: owc.warband.personalityPoints,
		PERSONALITYPERCENT: Math.floor(owc.warband.personalityPoints / owc.warband.points * 100),
		personalitiesInPoints: owc.settings.options.personalitiesInPoints,
		text: {},
		'rule-violations': []
	};
	for (let r of resources)
	{
		variables.text[r] = owc.helper.translate(r, variables);
	}
	if (owc.settings.options.applyRuleChecks)
	{
		for (let rulecheckResult of owc.rulecheck.checkAll())
		{
			variables["rule-violations"].push(
				{
					text: owc.rulecheck.getText(rulecheckResult)
				}
			);
		};
	};
	let wrapperNode = document.querySelector("#warbandfooter");
	owc.ui.setElementContent(wrapperNode, pageSnippets[formsCore.pageSnippetGroup]["warband-summary"].produce(formsCore, variables));
};

formsCore.makeEditable = function (refNode)
{
	refNode.setAttribute("contenteditable", "true");
	refNode.setAttribute("spellcheck", "false");
	refNode.onfocus = (focusEvent) =>
	{
		if (focusEvent.target.innerText === (focusEvent.target.getAttribute("data-defaultvalue") ?? ""))
		{
			focusEvent.target.innerText = "";
		};
	};
	refNode.onblur = (blurEvent) =>
	{
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
