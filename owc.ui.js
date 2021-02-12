"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.ui = {};

owc.ui.sweepvolatilesEvent = "owc.ui.sweepvolatiles";
owc.ui.isPrinting = (window.location.getParam(owc.urlParam.print) !== "");
owc.ui.visualizer = null;
owc.ui.undoButton = null;
owc.ui.blurElement = null;

owc.ui.init = function ()
{
	if (owc.ui.isPrinting === false)
	{
		owc.ui.undoButton = document.getElementById("undo-button");
		if (owc.ui.undoButton !== null)
		{
			owc.ui.undoButton.addEventListener("animationend", () => owc.ui.undoButton.classList.remove("animated"));
		};
		owc.ui.blurElement = document.getElementById("blur");
		window.addEventListener("click", owc.ui.sweepVolatiles);
	};
};

owc.ui.initView = function ()
{
	owc.ui.wait("Rendering");
	if (owc.ui.visualizer !== null)
	{
		owc.ui.visualizer.unload();
	};
	let viewFullname = owc.settings.viewMode + "view";
	/* if view is not loaded yet, we will import it; then initView() again. */
	if (window[viewFullname] === undefined)
	{
		pageSnippets.import("./views/" + viewFullname + "/" + viewFullname + ".xml").then(owc.ui.initView);
	}
	else
	{
		owc.ui.visualizer = window[viewFullname];
		owc.ui.visualizer.init();
		owc.ui.printWarband();
		owc.ui.waitEnd();
	};
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
	if (owc.ui.isPrinting === false)
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
	let params = {};
	params[owc.urlParam.warband] = owc.warband.toString();
	document.title = owc.helper.nonBlankWarbandName() + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - " + owc.meta.title;
	// document.head.querySelector("meta[property=\"og:title\"]").setAttribute("content", owc.meta.title);
	// document.head.querySelector("meta[property=\"og:url\"]").setAttribute("content", window.location.setParams(params, false, false));
	// document.head.querySelector("meta[property=\"og:description\"]").setAttribute("content", owc.helper.nonBlankWarbandName() + " (" + owc.warband.figureCount + " " + owc.resources.defaultText("figures") +", "+ owc.warband.points + " " + owc.resources.defaultText("points") + ")");
};

owc.ui.refreshUndoButton = function ()
{
	if (owc.ui.isPrinting === false)
	{
		let undoTooltip = owc.ui.undoButton.querySelector(".tooltip");
		if (owc.editor.undoer.canUndo === true)
		{
			owc.ui.undoButton.classList.remove("disabled");
			(undoTooltip !== null) ? undoTooltip.innerHTML = "Undo: " + owc.editor.undoer.lastChangeDescription + "." : null;
		}
		else
		{
			owc.ui.undoButton.classList.add("disabled");
			(undoTooltip !== null) ? undoTooltip.innerHTML = "Nothing to undo." : null;
		};
	};
};

owc.ui.showBluebox = function (element)
{
	function _pixelValue(text)
	{
		let rex = /\d+/.exec(text);
		return (rex !== null) ? Number(rex[0]) : 0;
	};
	owc.ui.sweepVolatiles();
	owc.ui.blurPage("editor-only");
	if (element !== null)
	{
		element.scrollTo(0, 0);
		let maxWidth = _pixelValue(window.getComputedStyle(element.querySelector("div.blue-viewport")).maxWidth);
		let windowWidth = document.documentElement.clientWidth;
		let elementLeft = (windowWidth * 0.45);
		let elementMarginLeft = _pixelValue(window.getComputedStyle(element).marginLeft);
		if (elementLeft + maxWidth > windowWidth)
		{
			elementLeft = windowWidth - maxWidth;
			if (elementLeft < elementMarginLeft * 2)
			{
				elementLeft = elementMarginLeft * 2;
			};
		};
		let translate = element.offsetLeft - elementLeft;
		element.style.setProperty("width", Math.ceil(translate) + "px");
		element.style.setProperty("transform", "translate(-" + Math.floor(translate + elementMarginLeft) + "px)");
	}
	else
	{
		console.warn("Seems like the requested Bluebox is not ready yet. Try again later.");
	};
};

owc.ui.closeBlueboxes = function ()
{
	for (let volatileElement of document.body.querySelectorAll("div.blue"))
	{
		volatileElement.style.transform = "translate(0px)";
	};
};

owc.ui.sweepVolatiles = function (anyEvent)
{
	(anyEvent instanceof Event) ? anyEvent.stopPropagation() : null;
	window.dispatchEvent(new CustomEvent(owc.ui.sweepvolatilesEvent));
	owc.ui.unblurPage();
	owc.ui.closeBlueboxes();
	Menubox.hideAll();

};

owc.ui.scrollToBottom = function ()
{
	let desiredScrollY = document.getElementById("warbandCanvas").getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
	window.scrollTo(
	{
		left: window.scrollX,
		top: (window.scrollY < desiredScrollY) ? desiredScrollY : window.scrollY,
		behavior: "smooth"
	}
	);
};

owc.ui.blurPage = function (blurClasses)
{
	for (let c of owc.ui.blurElement.classList)
	{
		owc.ui.blurElement.classList.remove(c);
	};
	for (let blurClass of blurClasses.split(" "))
	{
		if (blurClass !== "")
		{
			owc.ui.blurElement.classList.add(blurClass);
		};
	};
	owc.ui.blurElement.style.visibility = "visible";
};

owc.ui.unblurPage = () => owc.ui.blurElement.style.visibility = "hidden";

owc.ui.wait = (message = "Working") =>
{
	let loadingOverlay = document.getElementById("loading-wrapper");
	loadingOverlay.querySelector(".loading-text").innerText = message + "...";
	loadingOverlay.querySelector(".loading-gradient").classList.add("animated");
	loadingOverlay.style.visibility = "visible";
};
owc.ui.waitEnd = () =>
{
	let loadingOverlay = document.getElementById("loading-wrapper");
	loadingOverlay.style.visibility = "hidden"
		loadingOverlay.querySelector(".loading-gradient").classList.remove("animated");
};
owc.ui.isTouchDevice = ("ontouchstart" in document.documentElement);
