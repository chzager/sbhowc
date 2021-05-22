"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var listview = {};

listview.init = function ()
{
	formsCore.init("listview");
	listview.unload = formsCore.unload;
	listview.unitMenu = formsCore.unitMenu;
	listview.refreshWarbandName = formsCore.refreshWarbandName;
	listview.refreshUnit = formsCore.refreshUnit;
	listview.refreshPasteUnitButton = formsCore.refreshPasteUnitButton;
	listview.onValueEdited = formsCore.onValueEdited;
	listview.makeEditable = formsCore.makeEditable;
};

listview.getWarbandHtml = function ()
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
		"default-warband-name": owc.helper.translate("defaultWarbandName"),
		"add-unit": owc.helper.translate("addUnit")
	};
	result = pageSnippets.listview.main.produce(listview, variables);
	if (owc.ui.isPrinting)
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

listview.listUnits = function (refNode)
{
	let variables =
	{
		"unit-index": null,
		"default-unit-name": owc.helper.translate("defaultUnitName")
	};
	for (let u = 0, uu = owc.warband.units.length; u < uu; u += 1)
	{
		variables["unit-index"] = u;
		let unitNode = pageSnippets.listview["unit-row"].produce(formsCore, variables);
		formsCore.refreshUnit(u, unitNode);
		refNode.appendChild(unitNode);
	};
};

listview.listPointsPools = function (refNode)
{
	for (let poolKey in Warband.POINTSPOOLS)
	{
		let poolName = Warband.POINTSPOOLS[poolKey];
		let variables =
		{
			"pool-name": poolName,
			"pool-label": owc.helper.translate(poolName)
		};
		let pointsPoolElement = pageSnippets.listview.pointspool.produce(formsCore, variables);
		pointsPoolElement.style.display = "none"; // points pool is hidden by default
		refNode.appendChild(pointsPoolElement);
	};
};

listview.refeshPointsPools = function()
{
	console.log("listview.refeshPointsPools()");
	for (let poolName in owc.warband.pointsPools)
	{
		let poolElement = owc.ui.warbandCanvas.querySelector("[data-pointspool='" + poolName + "']")
		if (!!poolElement)
		{
			poolElement.style.display = (owc.warband.pointsPools[poolName] !== null) ? "table-row": "none";
			poolElement.querySelector("[data-editor='pointspool']").innerHTML = owc.warband.pointsPools[poolName];
		};
	};
};

listview.refreshWarbandSummary = function()
{
	listview.refeshPointsPools();
	formsCore.refreshWarbandSummary();
};

