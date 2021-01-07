"use strict";

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
	owc.ui.wait();
	if (document.getElementById("warbandcode") === null)
	{
		pageSnippets.import("./snippets/warbandcode.xml", _showWarbandCode);
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
	owc.ui.wait();
	if (document.getElementById("restorer") === null)
	{
		pageSnippets.import("snippets/restorer.xml", _showRestorer);
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
	owc.ui.wait();
	if (document.getElementById("settings") === null)
	{
		pageSnippets.import("./snippets/settings.xml", _showSettings);
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
	owc.ui.wait();
	fileIo.requestClientFile(clickEvent, (fileEvent) =>
	{
		let warbandCode = fileEvent.target.result;
		try
		{
			owc.importWarband(warbandCode);
			owc.ui.waitEnd();
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
	fileIo.offerFileToClient(owc.helper.getWarbandName() + ".sbh.txt", owc.warband.toString());
};

owc.topMenu.warbandMenuClick = function (clickEvent)
{
	let viewport = clickEvent.target.getBoundingClientRect();
	clickEvent.stopPropagation();
	owc.topMenu.warbandMenu.popupAt(Math.floor(viewport.bottom + window.scrollY), Math.floor(viewport.left + window.scrollX));
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
