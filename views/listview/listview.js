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
	listview.dispatchEditorEvent = htmlForm.dispatchEditorEvent;
};

listview.getWarbandHtml = function ()
{
	console.log("listview.getWarbandHtml");
	let result;
	let warbandName = owc.warband.name;
	if (warbandName === "")
	{
		warbandName = ui.translate("defaultWarbandName");
	};
	let variables =
	{
		"count": ui.translate("count"),
		"name": ui.translate("name"),
		"points": ui.translate("points"),
		"quality": ui.translate("quality"),
		"combat": ui.translate("combat"),
		"specialrules": ui.translate("specialrules"),
		"warband-name": owc.warband.name,
		"warband-name-notempty": warbandName,
		"warband-name-prompt": ui.translate("warbandNamePrompt")
	};
	result = pageSnippets.produceFromSnippet("listview", listview, variables);
	if (ui.isInteractive === false)
	{
		dhtml.removeNodesByQuerySelectors(["select", "[data-editor]", ".specialruleEditorSeparator", ".addunit"], result);
		dhtml.removeClasses(["interactive", "screenfx", "out-of-scope"], result);
	};
	return result;
};

listview.listUnits = function (refNode)
{
	for (let u = 0; u < owc.warband.units.length; u += 1)
	{
		refNode.appendChild(listview.getUnitHtml(u));
	};
};

listview.getUnitHtml = function (unitIndex)
{
	let result;
	let variables =
	{
		"unit-index": unitIndex,
		"unit-name-prompt": ui.translate("unitNamePrompt")
	};
	result = pageSnippets.produceFromSnippet("listview-unit-row", htmlForm, variables);
	htmlForm.refreshUnit(unitIndex, result);
	return result;
};

listview.refreshUnit = function (unitIndex, refNode = null)
{
	htmlForm.refreshUnit(unitIndex, refNode);
};

listview.refreshWarbandSummary = function ()
{
	htmlForm.refreshWarbandSummary();
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
