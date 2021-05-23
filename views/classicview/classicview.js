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
	formsCore.init("classicview");
	classicview.columnCount = 2;
	classicview.unitMenu = formsCore.unitMenu;
	classicview.refreshWarbandName = formsCore.refreshWarbandName;
	classicview.refreshUnit = formsCore.refreshUnit;
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

classicview.getWarbandHtmlElement = function ()
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
	result = pageSnippets.classicview.main.produce(classicview, variables);
	if (owc.ui.isPrinting)
	{
		htmlBuilder.removeChildrenByQuerySelectors(["select", "input", ".specialruleEditorSeparator", ".addunit"], result);
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
	let variables =
	{
		"rows": [],
		"columns": classicview.columnCount
	};
	let requiredCells = (owc.warband.units.length + (((owc.ui.isPrinting) ? 0 : 1)) + 1);
	for (let r = 0, rr = Math.ceil(requiredCells / classicview.columnCount); r < rr; r += 1)
	{
		variables.rows.push(r);
	};
	let tableNode = pageSnippets.classicview["units-table"].produce(classicview, variables);
	refNode.appendChild(tableNode);
	classicview.insertUnitSheets(refNode);
	let cells = refNode.querySelectorAll("#unitsgrid > tr > td");
	let pointspoolsCell = cells[owc.warband.units.length + ((owc.ui.isPrinting) ? 0: 1)];
	pointspoolsCell.removeAttribute("data-unitindex");
	pointspoolsCell.appendChild(pageSnippets.classicview["pointspools-sheet"].produce(formsCore,
		{
			"pointsPools": owc.helper.translate("pointsPools")
		}
		));
	if (owc.ui.isPrinting === false)
	{
		let additemsCell = cells[owc.warband.units.length];
		additemsCell.removeAttribute("data-unitindex");
		additemsCell.id = "additmes-container";
		additemsCell.appendChild(pageSnippets.classicview["add-unit"].produce(formsCore,
			{
				"add-unit": owc.helper.translate("addUnit")
			}
			));
	};
};

classicview.listPointsPools = function (refNode)
{
	for (let poolKey in Warband.POINTSPOOLS)
	{
		let poolName = Warband.POINTSPOOLS[poolKey];
		let variables =
		{
			"pool-name": poolName,
			"pool-label": owc.helper.translate(poolName),
			"points": owc.helper.translate("points")
		};
		let pointsPoolElement = pageSnippets.classicview.pointspool.produce(formsCore, variables);
		pointsPoolElement.style.display = "none"; // points pool is hidden by default
		refNode.querySelector("#pointspools-container").appendChild(pointsPoolElement);
	};
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
		let unitSheetNode = pageSnippets.classicview["unit-sheet"].produce(formsCore, variables);
		formsCore.refreshUnit(u, unitSheetNode);
		unitSheetCells[u].appendChild(unitSheetNode);
	};
};

classicview.refeshPointsPools = function ()
{
	let hasAnyPointsPools = false;
	let pointsPoolsWrapper = owc.ui.warbandCanvas.querySelector("#pointspools-container").closest("td");
	for (let poolName in owc.warband.pointsPools)
	{
		let hasThisPool = (owc.warband.pointsPools[poolName] !== null);
		hasAnyPointsPools = hasAnyPointsPools || hasThisPool;
		let poolElement = owc.ui.warbandCanvas.querySelector("[data-pointspool='" + poolName + "']")
			if (!!poolElement)
			{
				poolElement.style.display = hasThisPool ? "table-row" : "none";
				poolElement.querySelector("[data-editor='pointspool']").innerHTML = owc.warband.pointsPools[poolName];
			};
	};
	pointsPoolsWrapper.style.display = hasAnyPointsPools ? "table-cell" : "none";
};

classicview.refreshWarbandSummary = function ()
{
	classicview.refeshPointsPools();
	formsCore.refreshWarbandSummary();
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
