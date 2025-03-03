"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/chzager/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var classictouchview = {};

classictouchview.init = function ()
{
	touchCore.init("classictouchview");
	classictouchview.columnCount = 2;
	classictouchview.unitMenu = touchCore.unitMenu;
	classictouchview.refreshWarbandName = touchCore.refreshWarbandName;
	classictouchview.onWarbandNameClick = touchCore.onWarbandNameClick;
	classictouchview.onUnitNameClick = touchCore.onUnitNameClick;
	classictouchview.refreshUnit = touchCore.refreshUnit;
	classictouchview.refreshPasteUnitButton = touchCore.refreshPasteUnitButton;
	classictouchview.makeEditable = touchCore.makeEditable;
	if (owc.isPrinting === false)
	{
		/* determining size of "M" for one or two columns choice (#52) */
		const mElement = htmlBuilder.newElement("span#_sizeOfM", "M", { style: "font-family:var(--serif-font);font-size:1rem;position:absolute;top:0px;left:0px;visibility:hidden;" });
		document.body.insertBefore(mElement, document.getElementById("warbandCanvas"));
		classictouchview.sizeOfM = mElement.offsetWidth;
		mElement.remove();
		console.debug("classictouchview.sizeOfM:", classictouchview.sizeOfM);
		window.addEventListener("resize", classictouchview.onWindowResize);
		classictouchview.onWindowResize();
	};
};

classictouchview.unload = function ()
{
	window.removeEventListener("resize", classictouchview.onWindowResize);
};

classictouchview.getWarbandHtmlElement = function ()
{
	let result;
	let variables =
	{
		count: owc.helper.translate("count"),
		name: owc.helper.translate("name"),
		points: owc.helper.translate("points"),
		quality: owc.helper.translate("quality"),
		combat: owc.helper.translate("combat"),
		specialrules: owc.helper.translate("specialrules"),
		'warband-name': owc.helper.nonBlankWarbandName(),
		'default-warband-name': owc.helper.translate("defaultWarbandName")
	};
	result = pageSnippets.classictouchview.produce(classictouchview, variables);
	if (owc.isPrinting)
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

classictouchview.listUnits = function (refNode)
{
	let variables =
	{
		rows: [],
		columns: classictouchview.columnCount
	};
	let requiredCells = (owc.warband.units.length + (((owc.isPrinting) ? 0 : 1)) + 1);
	for (let r = 0, rr = Math.ceil(requiredCells / classictouchview.columnCount); r < rr; r += 1)
	{
		variables.rows.push(r);
	};
	let tableNode = pageSnippets.classictouchview["units-table"].produce(classictouchview, variables);
	refNode.appendChild(tableNode);
	classictouchview.insertUnitSheets(refNode);
	let cells = refNode.querySelectorAll("#unitsgrid > tr > td");
	let pointspoolsCell = cells[owc.warband.units.length + ((owc.isPrinting) ? 0 : 1)];
	pointspoolsCell.removeAttribute("data-unitindex");
	pointspoolsCell.appendChild(pageSnippets.classictouchview["pointspools-sheet"].produce(touchCore,
		{
			pointsPools: owc.helper.translate("pointsPools")
		}
	));
	if (owc.isPrinting === false)
	{
		let additemsCell = cells[owc.warband.units.length];
		let clipboardUnit = owc.editor.clipboard.getUnit();
		let variables = {
			'add-unit': owc.helper.translate("addUnit"),
			'paste-unit-text': (!!clipboardUnit) ? owc.helper.translate("pasteUnit", { UNIT: clipboardUnit.name }) : "",
			'clipboard-unit-code': clipboardUnit?.code
		};
		additemsCell.removeAttribute("data-unitindex");
		additemsCell.id = "additmes-container";
		additemsCell.appendChild(pageSnippets.classictouchview["add-buttons"].produce(touchCore, variables));
	};
};

classictouchview.listPointsPools = function (refNode)
{
	for (let poolKey in Warband.POINTSPOOLS)
	{
		let poolName = Warband.POINTSPOOLS[poolKey];
		let variables =
		{
			'pool-name': poolName,
			'pool-label': owc.helper.translate(poolName),
			points: owc.helper.translate("points")
		};
		let pointsPoolElement = pageSnippets.classictouchview.pointspool.produce(touchCore, variables);
		pointsPoolElement.style.display = "none"; // points pool is hidden by default
		refNode.querySelector("#pointspools-container").appendChild(pointsPoolElement);
	};
};

classictouchview.insertUnitSheets = function (refNode)
{
	let unitSheetCells = refNode.querySelectorAll("td");
	let variables =
	{
		'unit-index': null,
		'default-unit-name': owc.helper.translate("defaultUnitName"),
		count: owc.helper.translate("count"),
		name: owc.helper.translate("name"),
		points: owc.helper.translate("points"),
		quality: owc.helper.translate("quality"),
		combat: owc.helper.translate("combat"),
		specialrules: owc.helper.translate("specialrules")
	};
	for (let u = 0, uu = owc.warband.units.length; u < uu; u += 1)
	{
		variables["unit-index"] = u;
		let unitSheetNode = pageSnippets.classictouchview["unit-sheet"].produce(touchCore, variables);
		touchCore.refreshUnit(u, unitSheetNode);
		unitSheetCells[u].appendChild(unitSheetNode);
	};
};

classictouchview.refeshPointsPools = function ()
{
	let hasAnyPointsPools = false;
	let pointsPoolsWrapper = owc.ui.warbandCanvas.querySelector("#pointspools-container").closest("td");
	for (let poolName in owc.warband.pointsPools)
	{
		let hasThisPool = (owc.warband.pointsPools[poolName] !== null);
		hasAnyPointsPools ||= hasThisPool;
		let poolElement = owc.ui.warbandCanvas.querySelector("[data-pointspool='" + poolName + "']");
		if (!!poolElement)
		{
			poolElement.style.display = hasThisPool ? "table-row" : "none";
			poolElement.querySelector("[data-editor='pointspool']").innerHTML = owc.warband.pointsPools[poolName] + "&#160;" + owc.helper.translate("points");
		};
	};
	pointsPoolsWrapper.style.display = hasAnyPointsPools ? "table-cell" : "none";
};

classictouchview.refreshWarbandSummary = function ()
{
	classictouchview.refeshPointsPools();
	touchCore.refreshWarbandSummary();
};

classictouchview.onWindowResize = function (resizeEvent)
{
	const WIDTH_THRESHOLD = 42; // "sizeOfM"-units; in classic touch view we allow "Special rules" to wrap
	console.debug("client width (Ms):", Number(document.body.clientWidth / classictouchview.sizeOfM));
	let setColumnCount = (Number(document.body.clientWidth / classictouchview.sizeOfM) <= WIDTH_THRESHOLD) ? 1 : 2;
	if (classictouchview.columnCount !== setColumnCount)
	{
		classictouchview.columnCount = setColumnCount;
		owc.ui.printWarband();
	};
};
