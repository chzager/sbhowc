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
	if (ui.visualizer !== null)
	{
		ui.visualizer.unload();
	};
	let viewFullName = owc.settings.viewMode + "view";
	pageSnippets.import("./views/" + viewFullName + "/" + viewFullName + ".xml", () =>
	{
		ui.visualizer = window[viewFullName];
		ui.visualizer.init();
		ui.printWarband();
	}
	);
};

ui.printUnit = function (unitIndex)
{
	ui.visualizer.refreshUnit(unitIndex);
	ui.visualizer.refreshWarbandSummary();
	ui.refreshUndoButton();
	ui.refreshWindowTitle();
};

ui.printWarband = function ()
{
	let currentScrollPos =
	{
		"x": window.scrollX,
		"y": window.scrollY
	};
	let warbandCanvas = document.getElementById("warbandCanvas");
	warbandCanvas.removeAllChildren();
	warbandCanvas.appendChild(ui.visualizer.getWarbandHtml());
	ui.visualizer.refreshWarbandSummary();
	ui.refreshWarbandName();
	if (ui.isInteractive === true)
	{
		ui.refreshUndoButton();
		editor.refreshPasteUnitButton();
	}
	else
	{
		dhtml.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
	window.scrollTo(currentScrollPos.x, currentScrollPos.y);
};

ui.refreshWarbandName = function ()
{
	ui.visualizer.refreshWarbandName();
	ui.refreshUndoButton();
	ui.refreshWindowTitle();
};

ui.refreshWindowTitle = function ()
{
	document.title = owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - " + owc.TITLE;
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
