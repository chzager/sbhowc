"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.ui =
{
	SWEEP_VOLATILES_EVENT: "owc.ui.sweepvolatiles",
	isTouchDevice: ("ontouchstart" in document.documentElement),
	visualizer: null,
	undoButton: document.getElementById("undo-button"),
	blurElement: document.getElementById("blur"),
	warbandCanvas: document.getElementById("warbandCanvas"),
	notifications: {
		count: 0,
		offset: 0
	}
};

owc.ui.init = function ()
{
	if (owc.isPrinting === false)
	{
		owc.ui.undoButton.addEventListener("animationend", () => owc.ui.undoButton.classList.remove("animated"));
		window.addEventListener("focus", owc.ui.printWarband);
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
		if ((owc.isPrinting) && (typeof window.print === "function"))
		{
			window.print();
		};
	};
	owc.ui.wait("Loading");
	if (owc.ui.visualizer !== null)
	{
		owc.ui.visualizer.unload?.();
	};
	let viewFullname = owc.settings.viewMode + "view";
	if (!!pageSnippets[viewFullname] === false)
	{
		pageSnippets.import("./views/" + viewFullname + "/" + viewFullname + ".xml").then(_initView, (e) => {
			console.error(e);
			owc.ui.waitEnd();
			owc.ui.warbandCanvas.appendChild(htmlBuilder.newElement("div.notification.red", "Error while loading view \"" + viewFullname + "\"."));
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
		x: window.scrollX,
		y: window.scrollY
	};
	owc.ui.setElementContent(warbandCanvas, owc.ui.visualizer.getWarbandHtmlElement());
	owc.ui.visualizer.refreshWarbandSummary();
	owc.ui.refreshWarbandName();
	if (owc.isPrinting === false)
	{
		owc.ui.refreshUndoButton();
		htmlBuilder.removeChildrenByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeChildrenByQuerySelectors([".noprint", ".tooltip"]);
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
	if (owc.isPrinting === false)
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

owc.ui.setElementContent = function(element, contentElement)
{
	if (!!element.firstElementChild)
	{
		element.replaceChild(contentElement, element.firstElementChild);
	}
	else
	{
		element.appendChild(contentElement);
	};
};

owc.ui.notify = function (text, color = "green")
{
	function _onAnimationEnd(animationEvent)
	{
		animationEvent.target.remove();
		if ((owc.ui.notifications.count -= 1) === 0)
		{
			owc.ui.notifications.offset = 0;
		}
	}
	let element = htmlBuilder.newElement("div.notification.popup." + color, text);
	element.addEventListener("animationend", _onAnimationEnd,	{once: true});
	document.body.appendChild(element);
	let rect = element.getBoundingClientRect();
	element.style.left = Math.round((document.body.clientWidth - rect.width) / 2) + "px";
	element.style.top = Math.round(rect.top + owc.ui.notifications.offset) + "px";
	owc.ui.notifications.count += 1;
	owc.ui.notifications.offset += rect.height + 6;
};

owc.ui.showNotification = function (element, cssClass = "visible")
{
	element.classList.add(cssClass);
	element.addEventListener("animationend", () => element.classList.remove(cssClass), {once: true});
};

owc.ui.showBluebox = function (element)
{
	function _pixelValue(text)
	{
		let rex = /\d+/.exec(text);
		return (rex !== null) ? Number(rex[0]) : 0;
	};
	owc.ui.sweepVolatiles();
	owc.ui.blurPage();
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
	window.dispatchEvent(new CustomEvent(owc.ui.SWEEP_VOLATILES_EVENT));
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

owc.ui.blurPage = function (blurClasses = "")
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

owc.ui.unblurPage = function()
{
	owc.ui.blurElement.style.visibility = "hidden";
};

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
