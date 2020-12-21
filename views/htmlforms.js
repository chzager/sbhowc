"use strict";

var htmlForm = {};

htmlForm.init=function()
{
	console.log("htmlForm.init()");
	htmlForm.editors= {};
	htmlForm.editors.qualitySelector = pageSnippets.produceFromSnippet("quality-selector", htmlForm);
	htmlForm.editors.combatSelector = pageSnippets.produceFromSnippet("combat-selector", htmlForm);
	htmlForm.editors.specialrulesSelector = pageSnippets.produceFromSnippet("specialrules-selector", htmlForm);
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
	if (eventSender.getAttribute("data-stopevent") === "true")
	{
		event.stopPropagation();
	};
	window.dispatchEvent(new CustomEvent("editor", editorEventData));
};


htmlForm.createSpecialruleAdditionaltextEditorSnippet = function ()
{
	/*
	const snippetName = "quality-selector";
	if (pageSnippets[snippetName] === undefined)
{
	let node = dhtml.createNode("input", "",
{
	"maxlength": "40",
	"value": additionalText,
	"data-editor": "specialruletext",
	"data-spaceafter": "1em"
	}
	);
	node.onmouseout = eventDispatcher;
	node.oninput = dhtml.fitInputSize;
	// dhtml.fitInputSize(node);
	pageSnippets.append(snippetName, node);
	};
	 */
};

htmlForm.getUnitIndex=function(refNode)
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

htmlForm.appendQualitySelector=function(refNode)
{
	let selectorNode =htmlForm.editors.qualitySelector.cloneNode(true);
		selectorNode.onchange=htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

htmlForm.appendCombatSelector=function(refNode)
{
	let selectorNode =htmlForm.editors.combatSelector.cloneNode(true);
		selectorNode.onchange=htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

htmlForm.appendSpecialrulesSelector=function(refNode)
{
	let selectorNode =htmlForm.editors.specialrulesSelector.cloneNode(true);
		selectorNode.onchange=htmlForm.dispatchEditorEvent;
	refNode.appendChild(selectorNode);
};

/* **** */

htmlForm.produceQualitySelector = function (refNode)
{
	for (let q = 2; q <= 6; q += 1)
	{
		refNode.appendChild(dhtml.createNode("option", "",
			{
				"value": q
			}, q.toString() + "+"));
	};
};

htmlForm.produceCombatSelector = function (refNode)
{
	for (let c = 6; c >= 0; c -= 1)
	{
		refNode.appendChild(dhtml.createNode("option", "",
			{
				"value": c
			}, c.toString()));
	};
};

htmlForm.produceSpecialrulesSelector = function (refNode)
{
	refNode.removeAllChildred();
	refNode.appendChild(dhtml.createNode("option", "",
		{}, ui.translate("addSpecialrule")));
	for (let s = 0; s < editor.specialrulesList.length; s += 1)
	{
		refNode.appendChild(dhtml.createNode("option", "",
			{
				"value": editor.specialrulesList[s].key
			}, editor.specialrulesList[s].text));
	};
};

/* --- */

htmlForm.listSpecialRules = function (refNode, unitIndex)
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
	function _createSpecialruleNode(unitIndex, specialruleIndex, additionalTextEditorCreator, eventDispatcher)
	{
		let result = dhtml.createNode("span", "specialrule-wrapper");
		let unit = owc.warband.units[unitIndex];
		let textNode = dhtml.createNode("span", "specialrule interactive",
		{
			"data-unitindex": unitIndex,
			"data-action": "removespecialrule",
			"data-value": specialruleIndex
		}
			);
		let specialruleText = ui.translate(unit.specialrules[specialruleIndex].key);
		if (unit.specialrules[specialruleIndex].additionalText === undefined)
		{
			textNode.appendChild(document.createTextNode(specialruleText));
			/*
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
			 */
		};
		textNode.appendChild(dhtml.createNode("div", "tooltip nowrap", {}, __specialruleHint(unit.specialrules[specialruleIndex].key)));
		if (owc.settings.ruleScope.includes(owc.resources.data[unit.specialrules[specialruleIndex].key].scope) === false)
		{
			textNode.classList.add("out-of-scope");
		};
		textNode.onclick = listview.dispatchEditorEvent;
		result.appendChild(textNode);
		return result;
	};
	let unit = owc.warband.units[unitIndex];
	for (let s = 0; s < unit.specialrules.length; s += 1)
	{
		let variables = {
			"index": s,
			"hint": _specialruleHint(unit.specialrules[s].key)
		};
		let specialruleNode = pageSnippets.produceFromSnippet("specialrule", htmlForm, variables);
		console.log("produced:" , specialruleNode.outerHTML);
		let xn = specialruleNode.querySelector("[data-specialruleindex]");
		xn.onclick = htmlForm.dispatchEditorEvent;
		xn.insertBefore(htmlForm.getSpecialRuleHtml(unitIndex, s), xn.firstChild);
		refNode.appendChild(specialruleNode);
		if (s < unit.specialrules.length - 1)
		{
			refNode.appendChild(dhtml.createNode("span", "", {}, ",\u00A0"));
		};
	};

};

htmlForm.getSpecialRuleHtml=function(unitIndex, specialruleIndex)
{
	// let unitIndex = htmlForm.getUnitIndex(refNode);
	// let specialruleIndex=refNode.getAttribute("data-specialruleindex");
	// console.log(refNode.outerHTML, unitIndex, specialruleIndex);
		let specialruleText = ui.translate(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
return document.createTextNode(specialruleText);
};
