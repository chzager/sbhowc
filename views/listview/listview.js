"use strict";

var listview = {};

listview.init = function ()
{
	htmlForm.init();
	listview.unload = htmlForm.unload;
	listview.unitMenu = htmlForm.unitMenu;
	listview.refreshWarbandName = htmlForm.refreshWarbandName;
	listview.refreshUnit = htmlForm.refreshUnit;
	listview.refreshWarbandSummary = htmlForm.refreshWarbandSummary;
	listview.refreshPasteUnitButton = htmlForm.refreshPasteUnitButton;
	listview.dispatchEditorEvent = htmlForm.dispatchEditorEvent;
	listview.makeEditable = htmlForm.makeEditable;
};

listview.getWarbandHtml = function ()
{
	let result;
	let variables =
	{
		"count": ui.translate("count"),
		"name": ui.translate("name"),
		"points": ui.translate("points"),
		"quality": ui.translate("quality"),
		"combat": ui.translate("combat"),
		"specialrules": ui.translate("specialrules"),
		"warband-name": owc.warband.name.notEmpty(ui.translate("defaultWarbandName")),
		"default-warband-name": ui.translate("defaultWarbandName")
	};
	result = pageSnippets.produceFromSnippet("listview", listview, variables);
	if (ui.isInteractive === false)
	{
		htmlBuilder.removeNodesByQuerySelectors(["select", "input", ".specialruleEditorSeparator", ".addunit"], result);
		htmlBuilder.removeClasses(["interactive", "screenfx", "out-of-scope"], result);
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
