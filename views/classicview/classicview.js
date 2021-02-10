"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var classicview = {};

classicview.init = function ()
{
	formsCore.init();
	classicview.columnCount = null;
	classicview.unitMenu = formsCore.unitMenu;
	classicview.refreshWarbandName = formsCore.refreshWarbandName;
	classicview.refreshUnit = formsCore.refreshUnit;
	classicview.refreshWarbandSummary = formsCore.refreshWarbandSummary;
	classicview.refreshPasteUnitButton = formsCore.refreshPasteUnitButton;
	classicview.makeEditable = formsCore.makeEditable;
	(owc.ui.isPrinting === false) ? window.addEventListener("resize", classicview.onWindowResize) : null;
	classicview.onWindowResize();
};

classicview.unload = function ()
{
	formsCore.unload();
	window.removeEventListener("resize", classicview.onWindowResize);
};

classicview.getWarbandHtml = function ()
{
	let result;
	let variables =
	{
		"count": owc.helper.translate("count"),
		"name": owc.helper.translate("name"),
		"points": owc.helper.translate("points"),
		"quality": owc.helper.translate("quality"),
		"combat": owc.helper.translate("combat"),
		"specialrules": owc.helper.translate("specialrules"),
		"warband-name": owc.helper.nonBlankWarbandName(),
		"default-warband-name": owc.helper.translate("defaultWarbandName")
	};
	result = pageSnippets.produce("classicview", classicview, variables);
	if (owc.ui.isPrinting === true)
	{
		htmlBuilder.removeNodesByQuerySelectors(["select", "input", ".specialruleEditorSeparator", ".addunit"], result);
		htmlBuilder.removeClasses(["interactive", "screenfx", "out-of-scope"], result);
		for (let editableNode of result.querySelectorAll("[contenteditable]"))
		{
			editableNode.setAttribute("contenteditable", "false");
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
		let gridNode = pageSnippets.produce(snippetName, classicview);
		refNode.appendChild(gridNode);
	};
	classicview.insertUnitSheets(refNode);
	let addItemsCell = refNode.querySelectorAll("#unitsgrid > tr > td")[owc.warband.units.length];
	addItemsCell.removeAttribute("data-unitindex");
	addItemsCell.id = "additmes-container";
	addItemsCell.appendChild(pageSnippets.produce("add-unit", formsCore, {"add-unit": owc.helper.translate("addUnit")}));
};

classicview.insertUnitSheets = function (refNode)
{
	let unitSheetCells = refNode.querySelectorAll("td");
	let variables =
	{
		"unit-index": null,
		"default-unit-name": owc.helper.translate("defaultUnitName"),
		"count": owc.helper.translate("count"),
		"name": owc.helper.translate("name"),
		"points": owc.helper.translate("points"),
		"quality": owc.helper.translate("quality"),
		"combat": owc.helper.translate("combat"),
		"specialrules": owc.helper.translate("specialrules")
	};
	for (let u = 0, uu = owc.warband.units.length; u < uu; u += 1)
	{
		variables["unit-index"] = u;
		let unitSheetNode = pageSnippets.produce("classicview-unit-sheet", formsCore, variables);
		formsCore.refreshUnit(u, unitSheetNode);
		unitSheetCells[u].appendChild(unitSheetNode);
	};
};

classicview.onWindowResize = function (resizeEvent)
{
	const thresholdWidth = 650;
	let setColumnCount = 2;
	if (owc.ui.isPrinting === false)
	{
		if (Number(document.body.clientWidth) <= thresholdWidth)
		{
			setColumnCount = 1;
		};
		if (classicview.columnCount !== setColumnCount)
		{
			classicview.columnCount = setColumnCount;
			owc.ui.printWarband();
		};
	};
};
