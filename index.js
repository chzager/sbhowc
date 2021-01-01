"use strict";

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init() === true)
{
	topMenu.init();
	editor.init();
	owc.settings.load();
	owc.fetchResources();
	document.getElementById("version").innerText = owc.VERSION;
};
