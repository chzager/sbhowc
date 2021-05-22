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
	touchCore.warbandNameMenu = touchCore.newPromptMenu("warbandname", "warbandNamePrompt");
	touchCore.unitNameMenu = touchCore.newPromptMenu("name", "unitNamePrompt");
	touchCore.unitCountMenu = touchCore.newNumericPromptMenu("count", "count")
	touchCore.createQualityMenu();
	touchCore.createCombatMenu();
	touchCore.specialrulesMenu = touchCore.newMenu("specialrules", "specialrules", [], ["ok", "cancel"], true);
	touchCore.pointsPoolMenu = touchCore.newNumericPromptMenu("pointspool", "pointsPools");

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

touchCore.createQualityMenu = function ()
{
	let items = []
	for (let q of owc.editor.qualityValues)
	{
		items.push(
		{
			"key": q,
			"text": q.toString() + "+"
		}
		);
	};
	touchCore.qualityMenu = touchCore.newMenu("quality", "quality", items, ["cancel"]);
};

touchCore.createCombatMenu = function ()
{
	let items = [];
	for (let c of owc.editor.combatValues)
	{
		items.push(
		{
			"key": c,
			"text": c.toString()
		}
		);
	};
	touchCore.combatMenu = touchCore.newMenu("combat", "combat", items, ["cancel"]);
};

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

touchCore.popupNumericEditor=function(clickEvent, numericEditorMenu, context, value, title = null)
{
	let editor = numericEditorMenu.element.querySelector("input");
	if (!!title)
	{
	numericEditorMenu.element.querySelector("div.title").innerHTML =title;
	};
	editor.value = value;
	touchCore.popupEditor(clickEvent, numericEditorMenu, context);
	editor.focus();
};

touchCore.onValueEdited = function (editorEvent)
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

touchCore.onWarbandNameClick = function (clickEvent)
{
	touchCore.popupEditor(clickEvent, touchCore.warbandNameMenu, null, owc.warband.name);
};

touchCore.onUnitNameClick = function (clickEvent)
{
	let unitIndex = clickEvent.target.closest("[data-unitindex]").getAttribute("data-unitindex");
	touchCore.popupEditor(clickEvent, touchCore.unitNameMenu, unitIndex, owc.warband.units[unitIndex].name);
};

touchCore.onUnitCountClick = function(clickEvent)
{
	let unitIndex = clickEvent.target.closest("[data-unitindex]").getAttribute("data-unitindex");
	touchCore.popupNumericEditor(clickEvent, touchCore.unitCountMenu, unitIndex, owc.warband.units[unitIndex].count, owc.helper.translate("countOfUnit", {"UNIT": owc.helper.nonBlankUnitName(owc.warband.units[unitIndex])}));
};

touchCore.onQualityClick = function (clickEvent)
{
	let unitIndex = Number(clickEvent.target.closest("[data-unitindex]").getAttribute("data-unitindex"));
	touchCore.qualityMenu.selectItem(owc.warband.units[unitIndex].quality);
	touchCore.popupMenubox(clickEvent, touchCore.qualityMenu, unitIndex);
};

touchCore.onCombatClick = function (clickEvent)
{
	let unitIndex = Number(clickEvent.target.closest("[data-unitindex]").getAttribute("data-unitindex"));
	touchCore.combatMenu.selectItem(owc.warband.units[unitIndex].combat);
	touchCore.popupMenubox(clickEvent, touchCore.combatMenu, unitIndex);
};

touchCore.onSpecialrulesClick = function (clickEvent)
{
	function _postRender(menuNode, unitIndex)
	{
		for (let itemNode of menuNode.querySelectorAll("[data-menuitem]"))
		{
			let specialruleKey = itemNode.getAttribute("data-menuitem").substr(0,2);
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
	let unitIndex = Number(clickEvent.target.closest("[data-unitindex]").getAttribute("data-unitindex"));
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
		menuItem["text"] = specialruleText;
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
				"text": specialrule.text
			};
			menuItems.push(menuItem);
		};
	};
	touchCore.specialrulesMenu.buildMenuItems(menuItems);
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

touchCore.onMenuboxEvent = function (menuboxEvent)
{
	let editorEvent = new CustomEvent("editor",
	{
		"detail":
		{
			"unitIndex": Number(menuboxEvent.detail.context),
			"originalEvent": menuboxEvent
		}
	}
		);
	if (menuboxEvent.target.document.querySelector("[data-menubox=\"" + menuboxEvent.detail.menuId + "\"].touchmenu") === null)
	{
		editorEvent.detail["action"] = menuboxEvent.detail.itemKey;
		window.dispatchEvent(editorEvent);
	}
	else
	{
		editorEvent.detail["editor"] = menuboxEvent.detail.menuId;
		if (menuboxEvent.detail.itemKey !== undefined)
		{
			editorEvent.detail["value"] = menuboxEvent.detail.itemKey;
			window.dispatchEvent(editorEvent);
		}
		else if (menuboxEvent.detail.buttonKey !== null)
		{
			if ((menuboxEvent.detail.menuId === "specialrules") && (menuboxEvent.detail.buttonKey === "ok"))
			{
				let unitIndex = menuboxEvent.detail.context;
				let unit = owc.warband.units[unitIndex];
				owc.editor.setUndoPoint("Modify special rules of " + owc.helper.nonBlankUnitName(unit));
				unit.specialrules.splice(0, unit.specialrules.length);
				for (let selectedKey of menuboxEvent.detail.selectedKeys)
				{
					unit.addSpecialrule(selectedKey.substr(0, 2), owc.resources.data);
					let additionaltextNode = (document.querySelector("[data-menuitem=\"" + selectedKey + "\"] [data-isadditionaltext]"));
					if (additionaltextNode !== null)
					{
						unit.specialrules[unit.specialrules.length - 1].additionalText = additionaltextNode.innerHTML;
					};
				};
				owc.warband.checkPointsPools();
				owc.storage.storeWarband();
				owc.ui.printUnit(unitIndex);
			}
			else if ((menuboxEvent.detail.menuId === "warbandname") && (menuboxEvent.detail.buttonKey === "ok"))
			{
				editorEvent.detail["value"] = touchCore.warbandNameMenu.element.querySelector("[data-menuitem=\"editor\"]").innerText;
				window.dispatchEvent(editorEvent);
			}
			else if ((menuboxEvent.detail.menuId === "name") && (menuboxEvent.detail.buttonKey === "ok"))
			{
				editorEvent.detail["value"] = touchCore.unitNameMenu.element.querySelector("[data-menuitem=\"editor\"]").innerText;
				window.dispatchEvent(editorEvent);
			}
			else if ((menuboxEvent.detail.menuId === "count") && (menuboxEvent.detail.buttonKey === "ok"))
			{
				editorEvent.detail["value"] = touchCore.unitCountMenu.element.querySelector("input").value;
				window.dispatchEvent(editorEvent);
			}
			else if ((menuboxEvent.detail.menuId === "pointspool") && (menuboxEvent.detail.buttonKey === "ok"))
			{
				editorEvent.detail["value"] = touchCore.pointsPoolMenu.element.querySelector("input").value;
				editorEvent.detail["poolname"] = menuboxEvent.detail.context;
				window.dispatchEvent(editorEvent);
			};
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
	refNode.removeAllChildren();
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
	wrapperNode.removeAllChildren();
	wrapperNode.appendChild(pageSnippets[touchCore.pageSnippetGroup]["warband-summary"].produce(touchCore, variables));
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
			"text": owc.helper.translate(button)
		}
		);
	};
	return new Menubox(menuId, menuDef);
};

touchCore.newPromptMenu = function (menuId, titleResource)
{
	let menuItem =
	{
		"key": "editor",
		"text": ""
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

touchCore.newNumericPromptMenu=function(menuId, titleResource)
{
	let menubox = touchCore.newMenu(menuId, titleResource, [], ["ok", "cancel"], true);
	menubox.element.querySelector("div.items").appendChild(htmlBuilder.newElement("input",
		{
			"type": "number",
			"onclick": (clickEvent) => clickEvent.stopPropagation(),
			"onkeypress": (keypressEvent) =>
			{
				if (keypressEvent.keyCode === 13)
					menubox.element.querySelector("[data-menubutton=\"ok\"]").click();
			}
		}
		));
	return menubox;
};
