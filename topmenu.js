"use strict";

var topMenu = {};

topMenu.init = function ()
{
	topMenu.warbandMenu = new Menubox("warbandMenu",
	{
		"newWarband": "New warband",
		"showWarbandCode": "Show warband code",
		"restoreWarband": "Restore warband"
	}
		);
	window.addEventListener("menubox", topMenu.onMenuboxEvent);
};

topMenu.newWarband = function ()
{
	let params = {};
	params[owc.urlParam.pid] = owc.generateNewPid();
	window.open(window.location.setParams(params, false, false));
};

topMenu.showWarbandCode = function ()
{
	function _showWarbandCode()
	{
		warbandcode.show();
	};
	if (document.getElementById("warbandcode") === null)
	{
		pageSnippets.import("./snippets/warbandcode.xml", _showWarbandCode);
	}
	else
	{
		_showWarbandCode();
	};
};

topMenu.showWarbandRestorer = function ()
{
	function _showRestorer()
	{
		restorer.show();
	};
	if (document.getElementById("restorer") === null)
	{
		pageSnippets.import("snippets/restorer.xml", _showRestorer);
	}
	else
	{
		_showRestorer();
	};
};

topMenu.printPreviewClick = function (clickEvent)
{
	let params = {};
	params[owc.urlParam.print] = "1";
	window.open(window.location.setParams(params, true, false));
};

topMenu.showSettingsClick = function (clickEvent)
{
	function _showSettings()
	{
		settingsUi.show();
	};
	if (document.getElementById("settings") === null)
	{
		pageSnippets.import("./snippets/settings.xml", _showSettings);
	}
	else
	{
		_showSettings();
	};
};

topMenu.undoClick = function (clickEvent)
{
	if (editor.undoer.canUndo === true)
	{
		owc.warband.fromString(editor.undoer.undo(), owc.resources.data);
		ui.printWarband();
	}
};

topMenu.warbandFromFileClick = function (clickEvent)
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

topMenu.warbandToFileClick = function (clickEvent)
{
	fileIo.offerFileToClient(owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + ".sbh.txt", owc.warband.toString());
};

topMenu.warbandMenuClick = function (clickEvent)
{
	let viewport = clickEvent.target.getBoundingClientRect();
	clickEvent.stopPropagation();
	topMenu.warbandMenu.popupAt(Math.floor(viewport.bottom + window.scrollY), Math.floor(viewport.left + window.scrollX));
};

topMenu.onMenuboxEvent = function (menuboxEvent)
{
	switch (menuboxEvent.detail.itemKey)
	{
	case "newWarband":
		topMenu.newWarband();
		break;
	case "showWarbandCode":
		topMenu.showWarbandCode();
		break;
	case "restoreWarband":
		topMenu.showWarbandRestorer();
		break;
	};
};
