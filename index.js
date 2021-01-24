"use strict";

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init(window.location.getParam(owc.urlParam.pid)) === true)
{
	function _autoFill(values)
	{
		let nodes = document.querySelectorAll("[data-autofill]");
		for (let n = 0, nn = nodes.length; n < nn; n += 1)
		{
			let text = nodes[n].innerText;
			for (let key in values)
			{
				text = text.replace("{{" + key + "}}", values[key]);
			};
			nodes[n].innerText = text;
		};
	};
	_autoFill({"version": owc.VERSION,"origin": owc.ORIGIN});
	owc.topMenu.init();
	owc.editor.init();
	owc.settings.load();
	owc.fetchResources();
};
