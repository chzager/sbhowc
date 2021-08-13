"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.fileIo =
{
	getFileName: () => owc.helper.nonBlankWarbandName() + ".owc.txt",
	getFile: () => new File([owc.getWarbandCode(true)], owc.fileIo.getFileName(), { type: "text/plain" }),
	loadWarbandCode: (warbandCode) => {
		owc.ui.wait("Loading warband");
		let success = false;
		try
		{
			owc.importWarband(warbandCode);
			success = true;
		}
		catch (error)
		{
			owc.fileIo.notifyError(error, "Your file does not provide a valid warband code.");
		};
		owc.ui.waitEnd();
		return success;
	},
	httpRequest: (method, url, headers = {}, object = null, responseType = "") => {
		return new Promise((resolve, reject) =>
		{
			var httpRequest = new XMLHttpRequest();
			httpRequest.open(method, url);
			for (let headerKey in headers)
			{
				httpRequest.setRequestHeader(headerKey, headers[headerKey]);
			};
			httpRequest.responseType = responseType;
			httpRequest.onloadend = (httpEvent) => ((httpEvent.target.status === 200) ? resolve(httpEvent) : reject(new ReferenceError(method + " \"" + url + "\" returned HTTP status code " + httpEvent.target.status)))
			httpRequest.send(object);
		});
	},
	notifyError: (error, message) => {
		console.error(error);
		owc.ui.waitEnd();
		owc.ui.notify(message, "red");
	}
};

owc.fileIo.localDevice =
{
	load: (clickEvent) => fileIo.requestClientFile(clickEvent).then((fileEvent) => owc.fileIo.loadWarbandCode(fileEvent.target.result)),
	save: (clickEvent) => fileIo.offerFileToClient(owc.fileIo.getFileName(), owc.getWarbandCode(true))
};

owc.fileIo.oneDrive =
{
	CLIENT_ID: "100cf703-977f-456e-8ff1-2e5365ae24a8",
	QUERY_PARAMETERS: "select=name,@microsoft.graph.downloadUrl",
	FILTER: "folder,.txt",
	load: (clickEvent) => {
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
			success: (files) => owc.fileIo.httpRequest("GET", files.value[0]["@microsoft.graph.downloadUrl"]).then((response) => owc.fileIo.loadWarbandCode(response.target.responseText), (error) => owc.fileIo.notifyError(error, "Could not load file.")),
			cancel: () => owc.ui.waitEnd(),
			error: (error) => owc.fileIo.notifyError(error, "Something went wrong.")
		});
	},
	save: (clickEvent) => {
		let inputNode = htmlBuilder.newElement("input#oneDriveFileInput[type'file']");
		inputNode.style.display = "none";
		document.body.appendChild(inputNode);
		owc.ui.wait("Saving to OneDrive");
		OneDrive.save(
		{
			clientId: owc.fileIo.oneDrive.CLIENT_ID,
			action: "save",
			sourceInputElementId: "oneDriveFileInput",
			sourceFile: owc.fileIo.getFile(),
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
		});
		inputNode.remove();
	}
};

owc.fileIo.googleDrive =
{
	API_KEY: "AIzaSyDo8OYL-AhXy3olUlB1NEqwqiHUC4rG72o",
	CLIENT_ID: "613485586705-o1ogpm2jkb9ff1os5tgsl5iu9dk3436s",
	currentFile: { id: null, name: null },
	folder: { id: null, name: null },
	getPicker: () => {
		return new Promise((resolve, reject) =>
		{
			if (!owc.fileIo.googleDrive.picker)
			{
				try
				{
					owc.fileIo.googleDrive.picker = new GoogleDrivePicker(
					{
						apiKey: owc.fileIo.googleDrive.API_KEY,
						clientId: owc.fileIo.googleDrive.CLIENT_ID,
						onCancel: () => owc.ui.waitEnd()
					}, () => resolve(owc.fileIo.googleDrive.picker)
					);
				}
				catch (error)
				{
					reject(error);
				};
			}
			else
			{
				resolve(owc.fileIo.googleDrive.picker);
			};
		});
	},
	promptDestinationFolder: () => {
		return new Promise((resolve, reject) =>
		{
			owc.fileIo.googleDrive.getPicker().then((picker) =>
			{
				picker.onSelect = (file) =>
				{
					owc.fileIo.googleDrive.folder = 
					{
						id: file.id,
						name: file.title
					};
					resolve(file);
				};
				picker.open(new google.picker.DocsView(google.picker.ViewId.FOLDERS).setMode(google.picker.DocsViewMode.LIST).setIncludeFolders(true).setSelectFolderEnabled(true), "Select folder to save files in");
			}, (error) => reject(error));
		})
	},
	load: (clickEvent) => {
		function _load(fileContent, googeDriveFile)
		{
			if (owc.fileIo.loadWarbandCode(fileContent))
			{
				owc.fileIo.googleDrive.currentFile.id = googeDriveFile.id;
				owc.fileIo.googleDrive.currentFile.name = googeDriveFile.title;
			};
		};
		owc.ui.wait("Waiting for Google Drive");
		owc.fileIo.googleDrive.getPicker()
		.then(
			(picker) => {
				picker.onSelect = (file) =>
				{
					owc.fileIo.httpRequest("GET", "https://www.googleapis.com/drive/v2/files/" + file.id + "?key=" + owc.fileIo.googleDrive.API_KEY + "&alt=media&source=downloadUrl", { Authorization: "Bearer " + gapi.auth.getToken().access_token })
					.then((response) => _load(response.target.responseText, file), (error) => owc.fileIo.notifyError(error, "Could not load file."))
				};
				picker.open(new google.picker.DocsView(google.picker.ViewId.DOCUMENTS).setMode(google.picker.DocsViewMode.LIST).setMimeTypes("text/plain"), "Open warband file");
			},
			(error) => owc.fileIo.notifyError(error, "Something went wrong.")
		);
	},
	save: (clickEvent) => {
		function _save()
		{
			let metadata =
			{
				name: owc.fileIo.getFileName(),
				mimeType: "text/plain",
				parents: [owc.fileIo.googleDrive.folder.id]
			};
			let data = new FormData();
			data.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
			data.append("file", owc.fileIo.getFile());
			let method, url;
			if ((owc.fileIo.googleDrive.currentFile.id) && (owc.fileIo.googleDrive.currentFile.name === metadata.name))
			{
				method = "PUT";
				url = "https://www.googleapis.com/upload/drive/v2/files/" + owc.fileIo.googleDrive.currentFile.id + "?uploadType=multipart";
			}
			else
			{
				method = "POST";
				url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
			};
			owc.fileIo.httpRequest(method, url, { Authorization: "Bearer " + gapi.auth.getToken().access_token }, data)
			.then(
				(response) => 
				{
					let responseFile = JSON.parse(response.target.response);
					owc.fileIo.googleDrive.currentFile.id = responseFile.id;
					owc.fileIo.googleDrive.currentFile.name = responseFile.name;
					owc.storage.storeWarband();
					owc.ui.waitEnd();
					owc.ui.notify("Saved.");
				},
				(error) => 
				{
					owc.fileIo.googleDrive.currentFile.id = null;
					owc.fileIo.notifyError(error, "Something went wrong.");
				}
			);
		};
		owc.ui.wait("Saving to Google Drive");
		if (owc.fileIo.googleDrive.folder.id)
		{
			_save();
		}
		else
		{
			owc.fileIo.googleDrive.promptDestinationFolder().then(() => _save(), (error) => owc.fileIo.notifyError(error, "Something went wrong."));
		};
	}
};

/* Google Drive storage hooks */
owc.storage.hooks.warbandStore.push((data) => 
{
	if (owc.fileIo.googleDrive.currentFile.id) data.googleFileId = owc.fileIo.googleDrive.currentFile.id;
});
owc.storage.hooks.warbandRestore.push((data) =>
{
	if (data.googleFileId)
	{
		owc.fileIo.googleDrive.currentFile.id = data.googleFileId;
		owc.fileIo.googleDrive.currentFile.name = owc.fileIo.getFileName();
	};
});
