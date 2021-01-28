"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.topMenu = {};

owc.topMenu.init = function ()
{
	owc.topMenu.warbandMenu = new Menubox("warbandMenu",
	{
		"newWarband": "New warband",
		"showWarbandCode": "Show warband code",
		"restoreWarband": "Restore warband"
	}
		);
	window.addEventListener("menubox", owc.topMenu.menuboxEventListener);
	/* remove tooltips on touch devices */
	if (owc.ui.isTouchDevice === true)
	{
		htmlBuilder.removeNodesByQuerySelectors([".tooltip"], document.getElementById("top-menu"))
	};
};

owc.topMenu.newWarband = function ()
{
	let params = {};
	params[owc.urlParam.pid] = owc.generateNewPid();
	window.open(window.location.setParams(params, false, false));
};

owc.topMenu.showWarbandCode = function ()
{
	function _showWarbandCode()
	{
		warbandcode.show();
		owc.ui.waitEnd();
	};
	if (document.getElementById("warbandcode") === null)
	{
		owc.ui.wait("Loading");
		pageSnippets.import("./snippets/warbandcode.xml").then(_showWarbandCode);
	}
	else
	{
		_showWarbandCode();
	};
};

owc.topMenu.showWarbandRestorer = function ()
{
	function _showRestorer()
	{
		restorer.show();
		owc.ui.waitEnd();
	};
	if (document.getElementById("restorer") === null)
	{
		owc.ui.wait("Loading");
		pageSnippets.import("snippets/restorer.xml").then(_showRestorer);
	}
	else
	{
		_showRestorer();
	};
};

owc.topMenu.printPreviewClick = function (clickEvent)
{
	let params = {};
	params[owc.urlParam.print] = "1";
	window.open(window.location.setParams(params, true, false));
};

owc.topMenu.showSettingsClick = function (clickEvent)
{
	function _showSettings()
	{
		settingsUi.show();
		owc.ui.waitEnd();
	};
	if (document.getElementById("settings") === null)
	{
		owc.ui.wait("Loading");
		pageSnippets.import("./snippets/settings.xml").then(_showSettings);
	}
	else
	{
		_showSettings();
	};
};

owc.topMenu.undoClick = function (clickEvent)
{
	if (owc.editor.undoer.canUndo === true)
	{
		owc.warband.fromString(owc.editor.undoer.undo(), owc.resources.data);
		owc.ui.printWarband();
	}
};

owc.topMenu.warbandFromFileClick = function (clickEvent)
{
	fileIo.requestClientFile(clickEvent, (fileEvent) =>
	{
		let warbandCode = fileEvent.target.result;
		try
		{
			owc.importWarband(warbandCode);
		}
		catch (ex)
		{
			console.error(ex);
			window.alert("Your file does not provide a valid warband code.");
		};
	}
	);
};

owc.topMenu.warbandToFileClick = function (clickEvent)
{
	fileIo.offerFileToClient(owc.helper.nonBlankWarbandName() + ".sbh.txt", owc.warband.toString());
};

owc.topMenu.warbandMenuClick = function (clickEvent)
{
	let viewport = clickEvent.target.getBoundingClientRect();
	owc.topMenu.warbandMenu.popupAt(Math.floor(viewport.bottom + window.scrollY), Math.floor(viewport.left + window.scrollX), null, clickEvent);
};

owc.topMenu.menuboxEventListener = function (menuboxEvent)
{
	switch (menuboxEvent.detail.itemKey)
	{
	case "newWarband":
		owc.topMenu.newWarband();
		break;
	case "showWarbandCode":
		owc.topMenu.showWarbandCode();
		break;
	case "restoreWarband":
		owc.topMenu.showWarbandRestorer();
		break;
	};
};
