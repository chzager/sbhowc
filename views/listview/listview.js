"use strict";

var listview = {};

ui.visualizer = listview;

listview.init = function ()
{
	console.log("listview.init");
	htmlForm.init();
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
		"default-warband-name": ui.translate("defaultWarbandName"),
		"warband-name": warbandName,
		"warband-summary": "## TODO ##"
	};
	result = pageSnippets.produceFromSnippet("listview", listview, variables);
	return result;
	/*
	if (interactive === true)
{
	htmlNode.classList.add("screenfx");
	};
	if (interactive === false)
{
	dhtml.removeNodesByQuerySelectors(["select", "[data-editor]", ".specialruleEditorSeparator", ".addunit"], htmlNode);
	dhtml.removeClasses(["interactive", "screenfx", "out-of-scope"], htmlNode);
	};
	this.html.appendChild(htmlNode);
	 */
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
		"default-unit-name": ui.translate("defaultUnitName")
	};
	result = pageSnippets.produceFromSnippet("listview-unit-row", htmlForm, variables);
	htmlForm.listSpecialRules(result.querySelector("[data-staticvalueof=\"specialrules\"]"), unitIndex);
	listview.fillinUnitValues(result);
	return result;
};

listview.fillinUnitValues = function (refNode)
{
	let unitIndex = htmlForm.getUnitIndex(refNode);
	let unit = owc.warband.units[unitIndex];
	let unitName = unit.name;
	refNode.querySelector("[data-valueof=\"name\"]").innerText = unitName.notEmpty(ui.translate("defaultUnitName"));
	refNode.querySelector("[data-editor=\"name\"]").value = unit.name;
	if ((unit.isPersonality === true) && (owc.settings.options.highlightPersonalities === true))
	{
		refNode.querySelector("[data-valueof=\"name\"]").classList.add("personality");
	}
	else
	{
		refNode.querySelector("[data-valueof=\"name\"]").classList.remove("personality");
	};
	let unitCountText = "&#160;";
	if (unit.count > 1)
	{
		unitCountText = unit.count.toString() + "&#160;x";
	};
	refNode.querySelector("[data-valueof=\"count\"]").innerHTML = unitCountText;
	refNode.querySelector("[data-editor=\"count\"]").value = unit.count;
	refNode.querySelector("[data-staticvalueof=\"points\"]").innerText = unit.points;
	refNode.querySelector("[data-valueof=\"quality\"]").innerText = String(unit.quality) + "+";
	refNode.querySelector("[data-editor=\"quality\"]").value = unit.quality;
	refNode.querySelector("[data-valueof=\"combat\"]").innerText = unit.combat;
	refNode.querySelector("[data-editor=\"combat\"]").value = unit.combat;
};


listview.refreshUnit = function (unitIndex)
{
	console.log("listview.refreshUnit", unitIndex);
	listview.fillinUnitValues(document.querySelector("[data-unitindex=\"" + unitIndex + "\"]"));
};

listview.refreshWarbandName = function ()
{
	let warbandName = owc.warband.name;
	let targetNode = document.getElementById("warbandheader");
	if (warbandName === "")
	{
		warbandName = ui.translate("defaultWarbandName");
	};
	targetNode.querySelector("[data-valueof=\"warbandname\"]").innerText = warbandName;
	targetNode.querySelector("[data-editor=\"warbandname\"]").value = owc.warband.name;
};

listview.dispatchEditorEvent = function (editorEvent)
{
	htmlForm.dispatchEditorEvent(editorEvent)
};
