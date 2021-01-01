"use strict";

var classicview = {};

classicview.init = function ()
{
	htmlForm.init();
	classicview.columnCount = null;
	classicview.unitMenu = htmlForm.unitMenu;
	classicview.refreshWarbandName = htmlForm.refreshWarbandName;
	classicview.refreshUnit = htmlForm.refreshUnit;
	classicview.refreshWarbandSummary = htmlForm.refreshWarbandSummary;
	classicview.refreshPasteUnitButton = htmlForm.refreshPasteUnitButton;
	classicview.dispatchEditorEvent = htmlForm.dispatchEditorEvent;
	classicview.makeEditable = htmlForm.makeEditable;
	window.addEventListener("resize", classicview.onWindowResize);
	classicview.onWindowResize();
};

classicview.unload = function ()
{
	htmlForm.unload();
	window.removeEventListener("resize", classicview.onWindowResize);
};

classicview.getWarbandHtml = function ()
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
	let snippetName = "classicview-two-columns-row";
	let requiredRows = Math.ceil((owc.warband.units.length + 1) / 2);
	if (classicview.columnCount === 1)
	{
		snippetName = "classicview-single-column-row";
		requiredRows = owc.warband.units.length + 1;
	};
	/* requiredRows is unit count +1 because we produce one extra cell for add-items buttons */
	for (let c = 0; c < requiredRows; c += 1)
	{
		let gridNode = pageSnippets.produceFromSnippet(snippetName, classicview);
		refNode.appendChild(gridNode);
	};
	classicview.insertUnitSheets(refNode);
	let addItemsCell = refNode.querySelectorAll("#unitsgrid > tr > td")[owc.warband.units.length];
	addItemsCell.removeAttribute("data-unitindex");
	addItemsCell.id = "additmes-container"
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

classicview.onWindowResize = function (resizeEvent)
{
	const thresholdWidth = 650;
	let setColumnCount = 2;
	if (Number(document.body.clientWidth) <= thresholdWidth)
	{
		setColumnCount = 1;
	};

	if (classicview.columnCount !== setColumnCount)
	{
		classicview.columnCount = setColumnCount;
		ui.printWarband();
	};
};
