"use strict";

function windowEventListener(windowEvent) /* OK */
{
	let eventHandlerName = "onWindow" + windowEvent.type.substr(0, 1).toUpperCase() + windowEvent.type.substr(1).toLowerCase();
	if (ui.visualizer[eventHandlerName] !== undefined)
	{
		ui.visualizer[eventHandlerName](windowEvent);
	};
};

function onWindowFocus(windowEvent)
{
	// console.log("onWindowFocus");
	switch (windowEvent.type)
	{
	case "focus":
		editor.refreshPasteUnitButton();
		break;
	};
};
