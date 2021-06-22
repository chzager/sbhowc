"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.fileIo =
{
	localDevice: {},
	oneDrive:
	{
		CLIENT_ID: "100cf703-977f-456e-8ff1-2e5365ae24a8",
		QUERY_PARAMETERS: "select=name,@microsoft.graph.downloadUrl",
		FILTER: "folder,.txt",
		REQUIRES: [
			"lib/onedrive.js"
		]
	},
	googleDrive:
	{
		API_KEY: "AIzaSyDo8OYL-AhXy3olUlB1NEqwqiHUC4rG72o",
		CLIENT_ID: "613485586705-o1ogpm2jkb9ff1os5tgsl5iu9dk3436s",
		REQUIRES: [
			"https://www.google.com/jsapi?key=AIzaSyDo8OYL-AhXy3olUlB1NEqwqiHUC4rG72o",
			"https://apis.google.com/js/client.js?onload=initPicker",
			"lib/googledrive.js"
		]
	}
};

owc.fileIo.loadLibraries = function(urls)
{
	//
};

owc.fileIo.getFileName = function ()
{
	return owc.helper.nonBlankWarbandName() + ".owc.txt";
};

owc.fileIo.loadWarbandCode = function (warbandCode)
{
	owc.ui.wait("Loading warband");
	try
	{
		owc.importWarband(warbandCode);
	}
	catch (ex)
	{
		owc.fileIo.notifyError(ex, "Your file does not provide a valid warband code.");
	};
	owc.ui.waitEnd();
};

owc.fileIo.notifyError = function (error, message)
{
	console.error(error);
	owc.ui.waitEnd();
	owc.ui.notify(message, owc.ui.NOTIFICATION_COLOR_RED);
};

owc.fileIo.localDevice.load = function (clickEvent)
{
	fileIo.requestClientFile(clickEvent).then((fileEvent) => owc.fileIo.loadWarbandCode(fileEvent.target.result));
};

owc.fileIo.localDevice.save = function (clickEvent)
{
	fileIo.offerFileToClient(owc.fileIo.getFileName(), owc.getWarbandCode(true));
};

owc.fileIo.oneDrive.load = function ()
{
	owc.ui.wait("Waiting for OneDrive");
	OneDrive.open(
	{
		clientId: owc.fileIo.oneDrive.CLIENT_ID,
		action: "query",
		multiSelect: false,
		advanced:
		{
			queryParameters: owc.fileIo.oneDrive.QUERY_PARAMETERS,
			filter: owc.fileIo.oneDrive.FILTER
		},
		success: (files) => fileIo.fetchServerFile(files.value[0]["@microsoft.graph.downloadUrl"]).then((fileContent) => owc.fileIo.loadWarbandCode(fileContent)),
		cancel: () => owc.ui.waitEnd(),
		error: (error) => owc.fileIo.notifyError(error, "Something went wrong.")
	}
	);
};

owc.fileIo.oneDrive.save = function ()
{
	let file = new File([owc.getWarbandCode(true)], owc.fileIo.getFileName(),
	{
		type: "text/plain"
	}
		);
	let inputNode = htmlBuilder.newElement("input#oneDriveFileInput[type'file']");
	inputNode.style.display = "none";
	document.body.appendChild(inputNode);
	owc.ui.wait("Saving to OneDrive");
	OneDrive.save(
	{
		clientId: owc.fileIo.oneDrive.CLIENT_ID,
		action: "save",
		sourceInputElementId: "oneDriveFileInput",
		sourceFile: file,
		openInNewWindow: false,
		nameConflictBehavior: "replace",
		advanced:
		{
			queryParameters: owc.fileIo.oneDrive.QUERY_PARAMETERS,
			filter: owc.fileIo.oneDrive.FILTER
		},
		success: () => owc.ui.waitEnd() & owc.ui.notify("Saved."),
		cancel: () => owc.ui.waitEnd(),
		error: (error) => owc.fileIo.notifyError(error, "Something went wrong.")
	}
	);
	inputNode.remove();
};
