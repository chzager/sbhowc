"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.ui = {};

owc.ui.volatileSelectors = [".volatile", ".blue"];
owc.ui.isInteractive = (window.location.getParam(owc.urlParam.print) !== "1");
owc.ui.visualizer = null;

owc.ui.showElement = function (domElement, topPosition = null, leftPosition = null, blurPage = false)
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
		owc.ui.showElement(document.getElementById("blur"));
	};
};

owc.ui.sweepVolatiles = function ()
{
	for (let s = 0, ss = owc.ui.volatileSelectors.length; s < ss; s += 1)
	{
		let volatileElements = document.body.querySelectorAll(owc.ui.volatileSelectors[s]);
		for (let e = 0, ee = volatileElements.length; e < ee; e += 1)
		{
			if (volatileElements[e])
			{
				volatileElements[e].style.visibility = "hidden";
			};
		};
	};
};

owc.ui.initView = function ()
{
	owc.ui.wait("Rendering");
	if (owc.ui.visualizer !== null)
	{
		owc.ui.visualizer.unload();
	};
	let viewFullName = owc.settings.viewMode + "view";
	pageSnippets.import("./views/" + viewFullName + "/" + viewFullName + ".xml").then(() =>
	{
		owc.ui.visualizer = window[viewFullName];
		owc.ui.visualizer.init();
		owc.ui.printWarband();
		owc.ui.waitEnd();
	}
	);
};

owc.ui.printUnit = function (unitIndex)
{
	owc.ui.visualizer.refreshUnit(unitIndex);
	owc.ui.visualizer.refreshWarbandSummary();
	owc.ui.refreshUndoButton();
	owc.ui.refreshWindowTitle();
};

owc.ui.printWarband = function ()
{
	let currentScrollPos =
	{
		"x": window.scrollX,
		"y": window.scrollY
	};
	let warbandCanvas = document.getElementById("warbandCanvas");
	warbandCanvas.removeAllChildren();
	warbandCanvas.appendChild(owc.ui.visualizer.getWarbandHtml());
	owc.ui.visualizer.refreshWarbandSummary();
	owc.ui.refreshWarbandName();
	if (owc.ui.isInteractive === true)
	{
		owc.ui.refreshUndoButton();
		owc.editor.manangeUnitClipboard();
		htmlBuilder.removeNodesByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
	window.scrollTo(currentScrollPos.x, currentScrollPos.y);
};

owc.ui.refreshWarbandName = function ()
{
	owc.ui.visualizer.refreshWarbandName();
	owc.ui.refreshUndoButton();
	owc.ui.refreshWindowTitle();
};

owc.ui.refreshWindowTitle = function ()
{
	document.title = owc.helper.nonBlankWarbandName() + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - " + owc.TITLE;
};

owc.ui.refreshUndoButton = function ()
{
	if (owc.ui.isInteractive === true)
	{
		let undoButton = document.getElementById("undoButton");
		let undoTooltip = undoButton.querySelector(".tooltip");
		if (owc.editor.undoer.canUndo === true)
		{
			undoButton.classList.remove("disabled");
			(undoTooltip !== null) ? undoTooltip.innerHTML = "Undo: " + owc.editor.undoer.lastChangeDescription + "." : null;
		}
		else
		{
			undoButton.classList.add("disabled");
			(undoTooltip !== null) ? undoTooltip.innerHTML = "Nothing to undo." : null;
		};
	};
};

owc.ui.wait = function (message = "Working")
{
	document.querySelector("#loading-wrapper .loading-text").innerText = message + "...";
	document.getElementById("loading-wrapper").style.visibility = "visible";
};
owc.ui.waitEnd = () => document.getElementById("loading-wrapper").style.visibility = "hidden";
owc.ui.isTouchDevice = ("ontouchstart" in document.documentElement);
