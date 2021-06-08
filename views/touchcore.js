"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var touchCore = {};

touchCore.init = function (pageSnippetGroup)
{
	touchCore.pageSnippetGroup = pageSnippetGroup;
	touchCore.warbandNameMenu = touchCore.newInputMenu("warbandname", "warbandNamePrompt");
	touchCore.unitNameMenu = touchCore.newInputMenu("name", "unitNamePrompt");
	touchCore.unitCountMenu = touchCore.newInputNumberMenu("count", "count");
	touchCore.qualityMenu = touchCore.newMenu("quality", "quality", owc.editor.qualityValues, ["cancel"]);
	touchCore.combatMenu = touchCore.newMenu("combat", "combat", owc.editor.combatValues, ["cancel"]);
	touchCore.specialrulesMenu = touchCore.newMenu("specialrules", "specialrules", [], ["ok", "cancel"], true);
	touchCore.pointsPoolMenu = touchCore.newInputNumberMenu("pointspool", "pointsPools");

	touchCore.unitMenu = new Menubox("unitMenu",
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
		window.addEventListener("focus", touchCore.onWindowFocus);
		window.addEventListener("menubox", touchCore.onMenuboxEvent);
	};
};

touchCore.unload = function (menuboxEvent)
{
	window.removeEventListener("focus", touchCore.onWindowFocus);
	window.removeEventListener("menubox", touchCore.onMenuboxEvent);
};

touchCore.getEventUnitIndex = function(clickEvent) 
{
	let unitEnvelopeElement = clickEvent.target.closest("[data-unitindex]");
	return (unitEnvelopeElement) ? Number(unitEnvelopeElement.getAttribute("data-unitindex")) : null;
}

touchCore.popupMenubox = function (clickEvent, menubox, context)
{
	owc.ui.sweepVolatiles();
	owc.ui.blurPage("dim");
	menubox.popup(clickEvent, context, clickEvent.target, "center middle");
	if (menubox.element.offsetHeight > window.innerHeight)
	{
		let itemsList = menubox.element.querySelector(".items");
		itemsList.style.height = (itemsList.offsetHeight - (menubox.element.offsetHeight - window.innerHeight)) + "px";
	};
};

touchCore.popupEditor = function (clickEvent, editorMenu, context, text)
{
	touchCore.popupMenubox(clickEvent, editorMenu, context);
	let editorNode = editorMenu.element.querySelector("[data-menuitem=\"editor\"]");
	if (!!editorNode)
	{
		let range = document.createRange();
		let selection = window.getSelection();
		editorNode.innerHTML = text;
		range.setStart(editorNode, (text !== "") ? 1 : 0);
		range.collapse(true);
		selection.removeAllRanges();
		selection.addRange(range);
	};
	/* currently there is no definitive way to react when then virtual keyboard on touch device shrinks available height,
	so we set the position of the prompt menu to the upper quarter */
	editorMenu.element.style.top = Math.round((window.innerHeight / 4) - (editorMenu.element.offsetHeight / 2)) + "px";
	editorMenu.element.style.left = Math.round((document.body.clientWidth - editorMenu.element.offsetWidth) / 2) + "px";
};

touchCore.popupNumericEditor = function (clickEvent, numericEditorMenu, context, value, title = null)
{
	let editorNode = numericEditorMenu.element.querySelector("input");
	if (!!title)
	{
		numericEditorMenu.element.querySelector("div.title").innerHTML = title;
	};
	editorNode.value = value;
	touchCore.popupEditor(clickEvent, numericEditorMenu, context);
	editorNode.focus();
};

touchCore.onWarbandNameClick = function (clickEvent)
{
	touchCore.popupEditor(clickEvent, touchCore.warbandNameMenu, null, owc.warband.name);
};

touchCore.onUnitNameClick = function (clickEvent)
{
	let unitIndex = touchCore.getEventUnitIndex(clickEvent);
	touchCore.popupEditor(clickEvent, touchCore.unitNameMenu, unitIndex, owc.warband.units[unitIndex].name);
};

touchCore.onUnitCountClick = function (clickEvent)
{
	let unitIndex = touchCore.getEventUnitIndex(clickEvent);
	touchCore.popupNumericEditor(clickEvent, touchCore.unitCountMenu, unitIndex, owc.warband.units[unitIndex].count, owc.helper.translate("countOfUnit",
		{
			"UNIT": owc.helper.nonBlankUnitName(owc.warband.units[unitIndex])
		}
		));
};

touchCore.onQualityClick = function (clickEvent)
{
	let unitIndex = touchCore.getEventUnitIndex(clickEvent);
	touchCore.qualityMenu.selectItem(owc.warband.units[unitIndex].quality);
	touchCore.popupMenubox(clickEvent, touchCore.qualityMenu, unitIndex);
};

touchCore.onCombatClick = function (clickEvent)
{
	let unitIndex = touchCore.getEventUnitIndex(clickEvent);
	touchCore.combatMenu.selectItem(owc.warband.units[unitIndex].combat);
	touchCore.popupMenubox(clickEvent, touchCore.combatMenu, unitIndex);
};

touchCore.onSpecialrulesClick = function (clickEvent)
{
	function _postRender(menuNode, unitIndex)
	{
		for (let itemNode of menuNode.querySelectorAll("[data-menuitem]"))
		{
			let specialruleKey = itemNode.getAttribute("data-menuitem").substr(0, 2);
			let specialruleIndex = /\.(\d+)$/.exec(itemNode.getAttribute("data-menuitem"));
			if ((specialruleIndex !== null) || (itemNode.innerHTML.includes("...")))
			{
				let specialruleKey = itemNode.getAttribute("data-menuitem").substr(0, 2);
				let specialruleText = owc.helper.translate(specialruleKey);
				itemNode.removeChild(itemNode.firstChild);
				let wrapperNode = htmlBuilder.newElement("div");
				let textPreNode = htmlBuilder.newElement("span",
				{
					"onclick": (clickEvent) => clickEvent.target.parentElement.click()
				},
						specialruleText.substring(0, specialruleText.indexOf("...")));
				let editorNode = htmlBuilder.newElement("span",
				{
					"data-isadditionaltext": "yes",
					"data-defaultvalue": "...",
					"onclick": (clickEvent) => touchCore.specialrulesMenu.selectItem(clickEvent.target.closest("[data-menuitem]").getAttribute("data-menuitem"), true)
				},
						(specialruleIndex !== null) ? owc.warband.units[unitIndex].specialrules[Number(specialruleIndex[1])].additionalText : "...");
				let textPostNode = htmlBuilder.newElement("span",
				{
					"onclick": (clickEvent) => clickEvent.target.parentElement.click()
				},
						specialruleText.substring(specialruleText.indexOf("...") + 3));
				touchCore.makeEditable(editorNode);
				itemNode.appendChild(textPreNode);
				itemNode.appendChild(editorNode);
				itemNode.appendChild(textPostNode);
			};
			if (owc.settings.ruleScope.includes(owc.resources.data[specialruleKey].scope) === false)
			{
				itemNode.appendChild(htmlBuilder.newElement("span.out-of-scope", owc.resources.data[specialruleKey].scope.toUpperCase()));
			};
		};
	};
	let unitIndex = touchCore.getEventUnitIndex(clickEvent);
	let menuItems = [];
	let selectedSpecialrules = [];
	for (let s = 0, ss = owc.warband.units[unitIndex].specialrules.length; s < ss; s += 1)
	{
		let menuItem =
		{
			"key": owc.warband.units[unitIndex].specialrules[s].key,
			"selected": true
		};
		let specialruleText = owc.helper.translate(owc.warband.units[unitIndex].specialrules[s].key);
		if (specialruleText.includes("..."))
		{
			specialruleText = specialruleText.replace("...", owc.warband.units[unitIndex].specialrules[s].additionalText);
			menuItem["key"] += "." + s;
		}
		else
		{
			selectedSpecialrules.push(owc.warband.units[unitIndex].specialrules[s].key);
		};
		menuItem["label"] = specialruleText;
		menuItems.push(menuItem);
	};
	if (owc.warband.units[unitIndex].specialrules.length > 0)
	{
		menuItems.push(
		{
			"separator": true
		}
		);
	};
	for (let specialrule of owc.editor.specialrulesList)
	{
		if (selectedSpecialrules.includes(specialrule.key) === false)
		{
			let menuItem =
			{
				"key": specialrule.key,
				"label": specialrule.text
			};
			menuItems.push(menuItem);
		};
	};
	touchCore.specialrulesMenu.setItems(menuItems);
	_postRender(touchCore.specialrulesMenu.element, unitIndex);
	touchCore.popupMenubox(clickEvent, touchCore.specialrulesMenu, unitIndex);
};

touchCore.onPointsPoolClick = function (clickEvent)
{
	let poolName = clickEvent.target.getAttribute("data-poolname");
	touchCore.popupNumericEditor(clickEvent, touchCore.pointsPoolMenu, poolName, owc.warband.pointsPools[poolName], owc.helper.translate(poolName));
};

touchCore.onWindowFocus = function (focusEvent)
{
	owc.editor.manangeUnitClipboard();
};

touchCore.onClickEvent = function (clickEvent)
{
	let eventOrigin = clickEvent.target;
	while (eventOrigin.onclick === null)
	{
		eventOrigin = eventOrigin.parentNode;
	};
	let editorEvent = new CustomEvent("editor",
	{
		"detail":
		{
			"unitIndex":touchCore.getEventUnitIndex(clickEvent),
			"originalEvent": clickEvent
		}
	});
	for (let attribute of eventOrigin.attributes)
	{
		if (attribute.name.startsWith("data-"))
		{
			editorEvent.detail[attribute.name.substring(5)] = attribute.nodeValue;
		};
	};
	window.dispatchEvent(editorEvent);
};

touchCore.onMenuboxEvent = function (menuboxEvent)
{
	let eventData = menuboxEvent.detail;
	let editorEvent = new CustomEvent("editor",
	{
		"detail":
		{
			"unitIndex": eventData.context
		}
	}
		);
	if (eventData.menubox.element.classList.contains("touchmenu") === false)
	{
		editorEvent.detail["action"] = eventData.itemKey;
		window.dispatchEvent(editorEvent);
	}
	else
	{
		editorEvent.detail["editor"] = eventData.menubox.id;
		if ((eventData.itemKey) || (eventData.buttonKey === "ok"))
		{
			let editorNode = eventData.menubox.element.querySelector("[data-menuitem=\"editor\"]");
			let value = (!!editorNode) ? ((editorNode instanceof HTMLInputElement) ? editorNode.value : editorNode.innerText) : (eventData.itemKey ?? eventData.selectedKeys);
			if (eventData.menubox.dataType === "number")
			{
				value = Number((/\d+/.exec(value) ?? [0])[0]);
			};
			editorEvent.detail["value"] = value;
			switch (eventData.menubox.id)
			{
			case "specialrules":
				for (let i = 0, ii = eventData.selectedKeys.length; i < ii; i += 1)
				{
					let selectedKey = eventData.selectedKeys[i];
					let additionaltextNode = (eventData.menubox.element.querySelector("[data-menuitem=\"" + selectedKey + "\"]").querySelector("[data-isadditionaltext]"));
					if (additionaltextNode)
					{
						eventData.selectedKeys[i] = selectedKey.substr(0, 2) + "." + additionaltextNode.innerText;
					};
				};
				break;
			case "pointspool":
				editorEvent.detail["unitIndex"] = null;
				editorEvent.detail["poolname"] = eventData.context;
				break;
			};
			window.dispatchEvent(editorEvent);
		};
	};
};

touchCore.refreshWarbandName = function ()
{
	document.getElementById("warbandheader").innerText = owc.helper.nonBlankWarbandName();
};

touchCore.refreshUnit = function (unitIndex, refNode = null)
{
	if (refNode === null)
	{
		refNode = document.querySelector("[data-unitindex=\"" + unitIndex + "\"]");
	};
	let unit = owc.warband.units[unitIndex];
	let nameEditorNode = refNode.querySelector("[data-editor=\"name\"]");
	nameEditorNode.innerText = owc.helper.nonBlankUnitName(unit);
	if ((unit.isPersonality) && (owc.settings.options.highlightPersonalities))
	{
		nameEditorNode.classList.add("personality");
	}
	else
	{
		nameEditorNode.classList.remove("personality");
	};
	let unitCountText = "&#160;";
	if (unit.count > 1)
	{
		unitCountText = unit.count.toString() + "&#160;x";
	};
	refNode.querySelector("[data-valueof=\"count\"]").innerHTML = unitCountText;
	refNode.querySelector("[data-staticvalueof=\"points\"]").innerText = unit.points;
	refNode.querySelector("[data-valueof=\"quality\"]").innerText = String(unit.quality) + "+";
	refNode.querySelector("[data-valueof=\"combat\"]").innerText = unit.combat;
	touchCore.refreshSpecialrules(unitIndex, refNode.querySelector("[data-staticvalueof=\"specialrules\"]"));
};

touchCore.refreshSpecialrules = function (unitIndex, refNode)
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
	htmlBuilder.removeAllChildren(refNode);
	let unit = owc.warband.units[unitIndex];
	let specialrulesCount = unit.specialrules.length;
	let variables =
	{
		"is-printing": owc.ui.isPrinting,
		"add-specialrule": owc.helper.translate("addSpecialrule"),
		"specialrules": []
	};
	for (let s = 0; s < specialrulesCount; s += 1)
	{
		let specialrule = unit.specialrules[s];
		let specialruleNode;
		let specialruleText = owc.helper.translate(specialrule.key);
		let item =
		{
			"index": s,
			"hint": _specialruleHint(specialrule.key),
			"specialrule-text": specialruleText.replace("...", specialrule.additionalText),
			"scope-class": ((owc.settings.ruleScope.includes(owc.resources.data[specialrule.key].scope)) ? "" : "out-of-scope")
		};
		variables.specialrules.push(item);
	};
	let specialruleNode = pageSnippets[touchCore.pageSnippetGroup]["specialrules"].produce(touchCore, variables);
	refNode.appendChild(specialruleNode);
};

touchCore.refreshWarbandSummary = function ()
{
	const resources = ["total", "totalPoints", "totalFigures", (owc.settings.options.personalitiesInPoints) ? "personalitiesPoints" : "personalitiesPercent"];
	let variables =
	{
		"TOTAL": owc.warband.points,
		"COUNT": owc.warband.figureCount,
		"POINTS": owc.warband.figurePoints,
		"PERSONALITYPOINTS": owc.warband.personalityPoints,
		"PERSONALITYPERCENT": Math.floor(owc.warband.personalityPoints / owc.warband.points * 100),
		"personalitiesInPoints": owc.settings.options.personalitiesInPoints,
		"text": {},
		"rule-violations": []
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
				"text": owc.rulecheck.getText(rulecheckResult)
			}
			);
		};
	};
	let wrapperNode = document.querySelector("#warbandfooter");
	owc.ui.setElementContent(wrapperNode, pageSnippets[touchCore.pageSnippetGroup]["warband-summary"].produce(touchCore, variables));
};

touchCore.refreshPasteUnitButton = function (clipboardData)
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
		pasteUnitNode = pageSnippets[touchCore.pageSnippetGroup]["paste-unit"].produce(touchCore, variables);
		addunitContainer.appendChild(pasteUnitNode);
	};
};

touchCore.makeEditable = function (refNode)
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
		let newValue = blurEvent.target.innerText.replace(/[\r\n]/g, "").trim();
		blurEvent.target.innerText = (newValue !== "") ? newValue : defaulValue;
	};
	refNode.onkeypress = (keypressEvent) =>
	{
		if (keypressEvent.keyCode === 13)
		{
			keypressEvent.target.blur();
		};
	};
};

touchCore.newMenu = function (menuId, titleResource, items, buttons, multiselect = false)
{
	let menuDef =
	{
		"title": owc.helper.translate(titleResource),
		"class": "touchmenu",
		"multiselect": multiselect,
		"position": "fixed",
		"buttons": [],
		"items": items
	};
	for (let button of buttons)
	{
		menuDef.buttons.push(
		{
			"key": button,
			"label": owc.helper.translate(button)
		}
		);
	};
	return new Menubox(menuId, menuDef);
};

touchCore.newInputMenu = function (menuId, titleResource)
{
	let menuItem =
	{
		"key": "editor",
		"label": ""
	};
	let menubox = touchCore.newMenu(menuId, titleResource, [menuItem], ["ok", "cancel"]);
	menubox.element.classList.add("inputmenu");
	let editorNode = menubox.element.querySelector("[data-menuitem=\"editor\"]");
	touchCore.makeEditable(editorNode);
	editorNode.onclick = (clickEvent) => clickEvent.stopPropagation();
	editorNode.onkeypress = (keypressEvent) =>
	{
		if (keypressEvent.keyCode === 13)
		{
			menubox.element.querySelector("[data-menubutton=\"ok\"]").click();
		};
	};
	return menubox;
};

touchCore.newInputNumberMenu = function (menuId, titleResource)
{
	let menubox = touchCore.newMenu(menuId, titleResource, [], ["ok", "cancel"]);
	menubox.element.classList.add("inputnumbermenu");
	menubox.element.querySelector("div.items").appendChild(htmlBuilder.newElement("input",
		{
			"type": "number",
			"data-menuitem": "editor",
			"min": "0",
			"step": "1",
			"onclick": (clickEvent) => clickEvent.stopPropagation(),
			"onkeypress": (keypressEvent) =>
			{
				if (keypressEvent.keyCode === 13)
					menubox.element.querySelector("[data-menubutton=\"ok\"]").click();
			}
		}
		));
	menubox.dataType = "number";
	return menubox;
};
