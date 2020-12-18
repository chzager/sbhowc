"use strict";

var topMenu = {};

topMenu.newWarbandClick = function (clickEvent)
{
	let params = {};
	params[owc.urlParam.pid] = owc.generateNewPid();
	window.open(window.location.setParams(params, false, false));
};

topMenu.printPreviewClick = function (clickEvent)
{
	let params = {};
	params[owc.urlParam.print] = "1";
	window.open(window.location.setParams(params, true, false));
};

topMenu.showWarbandCodeClick = function (clickEvent)
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
		owc.warband.fromString(editor.undoer.undo(), owc.resources);
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
			owc.warband.fromString(warbandCode, owc.resources);
			editor.undoer.clear();
			ui.printWarband();
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
