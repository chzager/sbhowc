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
	formsCore.init();
	listview.unload = formsCore.unload;
	listview.unitMenu = formsCore.unitMenu;
	listview.refreshWarbandName = formsCore.refreshWarbandName;
	listview.refreshUnit = formsCore.refreshUnit;
	listview.refreshWarbandSummary = formsCore.refreshWarbandSummary;
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
	result = pageSnippets.produce("listview", listview, variables);
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
		let unitNode = pageSnippets.produce("listview-unit-row", formsCore, variables);
		formsCore.refreshUnit(u, unitNode);
		refNode.appendChild(unitNode);
	};
};
