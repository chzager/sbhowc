"use strict";

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init() === true)
{
	owc.fetchResources();
};

function initEventListeners()
{
	window.addEventListener("resize", windowEventListener);
	window.addEventListener("focus", onWindowFocus);
	window.addEventListener("editor", editor.eventListener);
	window.addEventListener("menubox", windowEventListener);
};
