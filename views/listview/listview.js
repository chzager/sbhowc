"use strict";

var listview = {};

/* TODO: this must be done in a function! */
ui.visualizer = listview;

listview.init = function ()
{
	console.log("listview.init");
	htmlForm.init();
	listview.unitMenu = htmlForm.unitMenu;
	listview.refreshWarbandName = htmlForm.refreshWarbandName;
	listview.refreshUnit = htmlForm.refreshUnit;
	listview.refreshWarbandSummary = htmlForm.refreshWarbandSummary;
	listview.dispatchEditorEvent = htmlForm.dispatchEditorEvent;
	listview.makeEditable = htmlForm.makeEditable;
};

listview.getWarbandHtml = function ()
{
	console.log("listview.getWarbandHtml");
	let result;
	let variables =
	{
		"count": ui.translate("count"),
		"name": ui.translate("name"),
		"points": ui.translate("points"),
		"quality": ui.translate("quality"),
		"combat": ui.translate("combat"),
		"specialrules": ui.translate("specialrules"),
		"warband-name": owc.warband.name,
		"default-warband-name": ui.translate("defaultWarbandName")
	};
	result = pageSnippets.produceFromSnippet("listview", listview, variables);
	if (ui.isInteractive === false)
	{
		dhtml.removeNodesByQuerySelectors(["select", "input", ".specialruleEditorSeparator", ".addunit"], result);
		dhtml.removeClasses(["interactive", "screenfx", "out-of-scope"], result);
		let editableNodes = result.querySelectorAll("[contenteditable]");
		for (let e = 0; e < editableNodes.length; e += 1)
		{
			editableNodes[e].setAttribute("contenteditable", "false");
		};
	};
	return result;
};

listview.listUnits = function (refNode)
{
	let variables =
	{
		"unit-index": null,
		"default-unit-name": ui.translate("defaultUnitName")
	};
	for (let u = 0; u < owc.warband.units.length; u += 1)
	{
		variables["unit-index"] = u;
		let unitNode = pageSnippets.produceFromSnippet("listview-unit-row", htmlForm, variables);
		htmlForm.refreshUnit(u, unitNode);
		refNode.appendChild(unitNode);
	};
};

listview.refreshPasteUnitButton = function (unitName, unitCode)
{
	let addunitContainer = document.querySelector("#additmes-container");
	let pasteUnitNode = addunitContainer.querySelector("[data-action=\"pasteunit\"]");
	if (pasteUnitNode !== null)
	{
		pasteUnitNode.remove();
	};
	let variables =
	{
		"unit-name": unitName,
		"unit-code": unitCode
	};
	pasteUnitNode = pageSnippets.produceFromSnippet("paste-unit", htmlForm, variables);
	addunitContainer.appendChild(pasteUnitNode);
};

