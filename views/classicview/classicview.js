"use strict";

var classicview = {};

/* TODO: this must be done in a function! */
ui.visualizer = classicview;

classicview.init = function ()
{
	console.log("classicview.init");
	htmlForm.init();
	classicview.unitMenu = htmlForm.unitMenu;
	classicview.refreshWarbandName = htmlForm.refreshWarbandName;
	classicview.refreshUnit = htmlForm.refreshUnit;
	classicview.refreshWarbandSummary = htmlForm.refreshWarbandSummary;
	classicview.dispatchEditorEvent = htmlForm.dispatchEditorEvent;
	classicview.makeEditable = htmlForm.makeEditable;
};

classicview.getWarbandHtml = function ()
{
	console.log("classicview.getWarbandHtml");
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
	result = pageSnippets.produceFromSnippet("classicview", classicview, variables);
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

classicview.listUnits = function (refNode)
{
	/* TODO: distinguish between single column and two column mode */
	let requiredCells = Math.ceil((owc.warband.units.length + 1) / 2);
	for (let c = 0; c < requiredCells; c += 1)
	{
		let gridNode = pageSnippets.produceFromSnippet("classicview-two-columns-row", classicview);
		refNode.appendChild(gridNode);
	};
	classicview.insertUnitSheets(refNode);
	let addItemsCell = refNode.querySelectorAll("#unitsgrid > tr > td")[owc.warband.units.length];
	addItemsCell.removeAttribute("data-unitindex");
	addItemsCell.id = "additmes-container"
		console.log(addItemsCell);
	addItemsCell.appendChild(pageSnippets.produceFromSnippet("add-unit", htmlForm));
};

classicview.insertUnitSheets = function (refNode)
{
	let unitSheetCells = refNode.querySelectorAll("td");
	let variables =
	{
		"unit-index": null,
		"default-unit-name": ui.translate("defaultUnitName"),
		"count": ui.translate("count"),
		"name": ui.translate("name"),
		"points": ui.translate("points"),
		"quality": ui.translate("quality"),
		"combat": ui.translate("combat"),
		"specialrules": ui.translate("specialrules")
	};
	for (let u = 0; u < owc.warband.units.length; u += 1)
	{
		variables["unit-index"] = u;
		let unitSheetNode = pageSnippets.produceFromSnippet("classicview-unit-sheet", htmlForm, variables);
		htmlForm.refreshUnit(u, unitSheetNode);
		unitSheetCells[u].appendChild(unitSheetNode);
	};
};

classicview.refreshPasteUnitButton = function (unitName, unitCode)
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
