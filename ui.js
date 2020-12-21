"use strict";

var ui = {};

ui.volatileSelectors = [".volatile", ".blue"];
ui.isInteractive = (window.location.getParam(owc.urlParam.print) !== "1");
ui.visualizer = null;

ui.showElement = function (domElement, topPosition = null, leftPosition = null, blurPage = false)
{
	domElement.style.display = "block";
	domElement.style.visibility = "visible";
	if (leftPosition != null)
	{
		domElement.style.left = leftPosition;
	};
	if (topPosition !== null)
	{
		domElement.style.top = topPosition;
	};
	if (blurPage === true)
	{
		ui.showElement(document.getElementById("blur"));
	};
};

ui.sweepVolatiles = function ()
{
	for (let s = 0; s < ui.volatileSelectors.length; s += 1)
	{
		let volatileElements = document.body.querySelectorAll(ui.volatileSelectors[s]);
		for (let e = 0; e < volatileElements.length; e += 1)
		{
			if (volatileElements[e])
			{
				volatileElements[e].style.visibility = "hidden";
			};
		};
	};
};

ui.initView = function ()
{
	function _importFinished1()
	{
		console.log("_importFinished1");
		pageSnippets.import("./views/listview/listview.xml", _importFinished2);
	};
	function _importFinished2()
	{
		console.log("_importFinished2");
		ui.visualizer.init();
		ui.printWarband();
	};
	// pageSnippets.import("./views/htmlforms.xml", _importFinished1);
	pageSnippets.import("./views/listview/listview.xml", _importFinished2);
	/*
	switch (owc.settings.viewMode)
{
	case "list":
	ui.visualizer = new ListView(owc.settings, owc.resources, document.getElementById("warbandCanvas"));
	break;
	default:
	ui.visualizer = new ClassicView(owc.settings, owc.resources, document.getElementById("warbandCanvas"));
	};
	 */
};

ui.printUnit = function (unitIndex)
{
	ui.visualizer.refreshUnit(unitIndex);
	// ui.visualizer.printWarbandSummary(owc.warband);
	ui.refreshUndoButton();
	ui.refreshWindowTitle();
};

ui.printWarband = function ()
{
	// ui.visualizer.printWarband(owc.warband, ui.isInteractive);
	let warbandCanvas = document.getElementById("warbandCanvas");
	warbandCanvas.removeAllChildred();
	warbandCanvas.appendChild(ui.visualizer.getWarbandHtml(owc.warband, ui.isInteractive));
	ui.refreshWindowTitle();
	if (ui.isInteractive === true)
	{
		ui.refreshUndoButton();
		editor.refreshPasteUnitButton();
	}
	else
	{
		dhtml.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
};

ui.PrintWarbandName = function ()
{
	ui.visualizer.printWarbandName();
	ui.refreshWindowTitle();
};

ui.refreshWindowTitle = function ()
{
	document.title = owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - " + owc.TITLE;
	owc.storeWarband();
};

ui.translate = function (key, variables)
{
	return owc.resources.translate(key, owc.settings.language, variables);
};

ui.refreshUndoButton = function ()
{
	let undoButton = document.getElementById("undoButton");
	if (editor.undoer.canUndo === true)
	{
		undoButton.classList.remove("disabled");
		undoButton.getElementsByClassName("tooltip")[0].innerHTML = "Undo: " + editor.undoer.lastChangeDescription + ".";
	}
	else
	{
		undoButton.classList.add("disabled");
		undoButton.getElementsByClassName("tooltip")[0].innerHTML = "Nothing to undo.";
	};
};
