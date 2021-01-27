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
		"count": owc.helper.translate("count"),
		"name": owc.helper.translate("name"),
		"points": owc.helper.translate("points"),
		"quality": owc.helper.translate("quality"),
		"combat": owc.helper.translate("combat"),
		"specialrules": owc.helper.translate("specialrules"),
		"warband-name": owc.helper.nonBlankWarbandName(),
		"default-warband-name": owc.helper.translate("defaultWarbandName")
	};
	result = pageSnippets.produce("listview", listview, variables);
	if (owc.ui.isInteractive === false)
	{
		htmlBuilder.removeNodesByQuerySelectors(["select", "input", ".specialruleEditorSeparator", ".addunit"], result);
		htmlBuilder.removeClasses(["interactive", "screenfx", "out-of-scope"], result);
		let editableNodes = result.querySelectorAll("[contenteditable]");
		for (let e = 0, ee = editableNodes.length; e < ee; e += 1)
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
		"default-unit-name": owc.helper.translate("defaultUnitName")
	};
	for (let u = 0, uu = owc.warband.units.length; u < uu; u += 1)
	{
		variables["unit-index"] = u;
		let unitNode = pageSnippets.produce("listview-unit-row", htmlForm, variables);
		htmlForm.refreshUnit(u, unitNode);
		refNode.appendChild(unitNode);
	};
};
