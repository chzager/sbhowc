"use strict";

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init() === true)
{
	topMenu.init();
	owc.settings.load();
	owc.fetchResources();
	document.getElementById("version").innerText = owc.VERSION;
};

function initEventListeners()
{
	window.addEventListener("resize", windowEventListener);
	window.addEventListener("focus", onWindowFocus);
	window.addEventListener("editor", editor.eventListener);
};

function windowEventListener(windowEvent)
{
	let eventHandlerName = "onWindow" + windowEvent.type.substr(0, 1).toUpperCase() + windowEvent.type.substr(1).toLowerCase();
	if (ui.visualizer[eventHandlerName] !== undefined)
	{
		ui.visualizer[eventHandlerName](windowEvent);
	};
};

function onWindowFocus(windowEvent)
{
	switch (windowEvent.type)
	{
	case "focus":
		editor.refreshPasteUnitButton();
		break;
	};
};
