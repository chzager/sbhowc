"use strict";

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init() === true)
{
	owc.settings.load();
	owc.fetchResources();
};

function initEventListeners()
{
	window.addEventListener("resize", windowEventListener);
	window.addEventListener("focus", onWindowFocus);
	window.addEventListener("editor", editor.eventListener);
	window.addEventListener("menubox", windowEventListener);
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
