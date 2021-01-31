"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

/* owc.init() returns false if no PID given and page needs to be reloaded */
if (owc.init(window.location.getParam(owc.urlParam.pid)) === true)
{
	function _autoFill(values)
	{
		for (let node of document.querySelectorAll("[data-autofill]"))
		{
			let text = node.innerText;
			for (let key in values)
			{
				text = text.replace("{{" + key + "}}", values[key]);
			};
			node.innerText = text;
		};
	};

	_autoFill(
	{
		"title": owc.TITLE,
		"version": owc.VERSION,
		"origin": owc.ORIGIN
	}
	);
	if (owc.ui.isInteractive === true)
	{
		owc.topMenu.init();
		htmlBuilder.removeNodesByQuerySelectors([".only-print"]);
	}
	else
	{
		htmlBuilder.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
	owc.editor.init();
	owc.settings.load();
	owc.fetchResources();
};
