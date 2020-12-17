"use strict";

var topMenu = {};

topMenu.undoClick = function(clickEvent) /* OK */
{
	if (owc.undoer.canUndo === true)
	{
		owc.warband.fromString(owc.undoer.undo(), owc.resources);
		printWarband();
	}
};

topMenu.newWarbandClick = function(clickEvent) /* OK */
{
	let params = {};
	params[urlParam.pid] = generateNewPid();
	window.open(window.location.setParams(params, false, false));
};

topMenu.printPreviewClick = function(clickEvent) /* todo */
{
	let params = {};
	params[urlParam.print] = "1";
	window.open(window.location.setParams(params, true, false));
};

topMenu.warbandToFileClick = function(clickEvent) /* OK */
{
	fileIo.offerFileToClient(owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + ".sbh.txt", owc.warband.toString());
};

topMenu.warbandFromFileClick = function(clickEvent) /* OK */
{
	fileIo.requestClientFile(clickEvent, (fileEvent) => {
	let warbandCode = fileEvent.target.result;
	try
	{
		owc.warband.fromString(warbandCode, owc.resources);
		owc.undoer.clear();
		printWarband();
	}
	catch (ex)
	{
		console.error(ex);
		window.alert("Your file does not provide a valid warband code.");
	};
	}
	);
};

topMenu.showWarbandCodeClick = function(clickEvent)
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

topMenu.showSettingsClick = function(clickEvent)
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