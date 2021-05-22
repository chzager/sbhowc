"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.ui =
{
	"sweepvolatilesEvent": "owc.ui.sweepvolatiles",
	"isPrinting": (window.location.getParam(owc.urlParam.PRINT) === "1"),
	"isTouchDevice": ("ontouchstart" in document.documentElement),
	"visualizer": null,
	"undoButton": document.getElementById("undo-button"),
	"blurElement": document.getElementById("blur"),
	"notifyElement": document.getElementById("master-notification"),
	"warbandCanvas": document.getElementById("warbandCanvas")
};

owc.ui.NOTIFICATION_COLOR_GREEN = "green";
owc.ui.NOTIFICATION_COLOR_YELLOW = "green";
owc.ui.NOTIFICATION_COLOR_RED = "red";

owc.ui.init = function ()
{
	console.debug("owc.ui.isPrinting:", owc.ui.isPrinting);
	if (owc.ui.isPrinting === false)
	{
		owc.ui.undoButton.addEventListener("animationend", () => owc.ui.undoButton.classList.remove("animated"));
		owc.ui.notifyElement.addEventListener("click", () => owc.ui.notifyElement.classList.remove("visible"));
		window.addEventListener("click", owc.ui.sweepVolatiles);
	};
};

owc.ui.initView = function ()
{
	function _initView()
	{
		owc.ui.wait("Rendering");
		owc.ui.visualizer = window[viewFullname];
		owc.ui.visualizer.init();
		owc.ui.printWarband();
		owc.ui.waitEnd();
		if ((owc.ui.isPrinting) && (typeof window.print === "function"))
		{
			window.print();
		};
	};
	owc.ui.wait("Loading");
	if (owc.ui.visualizer !== null)
	{
		owc.ui.visualizer.unload();
	};
	let viewFullname = owc.settings.viewMode + "view";
	if (!!pageSnippets[viewFullname] === false)
	{
		pageSnippets.import("./views/" + viewFullname + "/" + viewFullname + ".xml").then(_initView, (e) => {
			console.error(e);
			owc.ui.waitEnd();
			owc.ui.warbandCanvas.appendChild(htmlBuilder.newElement("div.global-notification.notification.red", "Error while loading view \"" + viewFullname + "\"."));
		});
	}
	else
	{
		_initView();
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
	document.title = owc.helper.nonBlankWarbandName() + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - " + owc.meta.TITLE;
};

owc.ui.refreshUndoButton = function ()
{
	if (owc.ui.isPrinting === false)
	{
		let undoTooltipElement = owc.ui.undoButton.querySelector(".tooltip");
		if (owc.editor.undoer.canUndo)
		{
			owc.ui.undoButton.classList.remove("disabled");
			(!!undoTooltipElement) ? undoTooltipElement.innerHTML = "Undo: " + owc.editor.undoer.lastChangeDescription + "." : null;
		}
		else
		{
			owc.ui.undoButton.classList.add("disabled");
			(!!undoTooltipElement) ? undoTooltipElement.innerHTML = "Nothing to undo." : null;
		};
	};
};

owc.ui.notify = function (text, color = owc.ui.NOTIFICATION_COLOR_GREEN)
{
	if (!!owc.ui.notifyElement)
	{
		if (owc.ui.notifyElement.classList.contains("visible") === false)
		{
			for (let cssClass of owc.ui.notifyElement.classList.values())
			{
				if (cssClass !== "notification")
				{
					owc.ui.notifyElement.classList.remove(cssClass);
				};
			};
			owc.ui.notifyElement.innerHTML = text;
			owc.ui.notifyElement.classList.add(color);
			owc.ui.notifyElement.style.left = Math.round((document.body.clientWidth - owc.ui.notifyElement.getBoundingClientRect().width) / 2) + "px";
			owc.ui.showNotification(owc.ui.notifyElement);
		};
	};
};

owc.ui.showNotification = function (element, cssClass = "visible")
{
	element.classList.add(cssClass);
	element.addEventListener("animationend", () => element.classList.remove(cssClass),
	{
		"once": true
	}
	);
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
	if (!!element)
	{
		element.scrollTo(0, 0);
		let maxWidth = _pixelValue(window.getComputedStyle(element.querySelector("div.blue-viewport")).maxWidth);
		let windowWidth = document.documentElement.clientWidth;
		let elementLeft = (windowWidth * 0.45);
		let elementMarginLeft = _pixelValue(window.getComputedStyle(element).marginLeft);
		if (elementLeft + maxWidth > windowWidth)
		{
			elementLeft = Math.max(windowWidth - maxWidth, elementMarginLeft * 2);
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
	let desiredScrollY = owc.ui.warbandCanvas.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
	window.scrollTo(
	{
		left: window.scrollX,
		top: Math.max(window.scrollY, desiredScrollY),
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

owc.ui.wait = function (message = "Working")
{
	let loadingOverlay = document.getElementById("loading-wrapper");
	loadingOverlay.querySelector(".loading-text").innerText = message + "...";
	loadingOverlay.querySelector(".loading-gradient").classList.add("animated");
	loadingOverlay.style.visibility = "visible";
};

owc.ui.waitEnd = function ()
{
	let loadingOverlay = document.getElementById("loading-wrapper");
	loadingOverlay.style.visibility = "hidden";
	loadingOverlay.querySelector(".loading-gradient").classList.remove("animated");
};
