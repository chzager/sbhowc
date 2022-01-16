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
		let success = owc.importWarband(warbandCode);
		owc.ui.waitEnd();
		if (success)
		{
			owc.ui.notify("Warband successfully loaded from file.");
		}
		else
		{
			owc.ui.notify("Your file does not provide a valid warband code.", "red");
		}
		return success;
	},
	localDevice: {
		load: (clickEvent) => fileIo.requestClientFile(clickEvent).then((fileEvent) => owc.fileIo.loadWarbandCode(fileEvent.target.result)),
		save: (clickEvent) => fileIo.offerFileToClient(owc.fileIo.getFileName(), owc.getWarbandCode(true))
	},
	_notifyError: (error, message) => {
		console.error(error);
		owc.ui.waitEnd();
		owc.ui.notify(message, "red");
	}
};

owc.cloud = {
	setReminder: (provider) => {
		localStorage.setItem("owc_reminder", JSON.stringify({
			pid: owc.pid,
			provider: provider,
			action: "fileSurfer"
		}));
	},
	oneDrive: {
		TITLE: "Microsoft OneDrive",
		FA_ICON: "fas fa-cloud",
		ROOT_FOLDER_ID: "root",
		cache: {},
		signIn: () => {
			owc.cloud.setReminder("oneDrive");
			fileSurfer.registerService("oneDrive");
			onedriveApi.signIn();
		},
		signOut: () => {
			fileSurfer.unregisterService();
			onedriveApi.signOut();
		},
		getSigninStatus: onedriveApi.getSigninStatus,
		getFolderContent: (folderId = owc.cloud.oneDrive.ROOT_FOLDER_ID) => new Promise((resolve) => onedriveApi.getFolderContent(folderId).then(
			(result) => {
				let files = [];
				for (let item of result.value)
				{
					let type = (!!item.file) ? "file" : ((!!item.folder) ? "folder" : null);
					if ((type === "folder") || ((type === "file") && (item.name.endsWith(".owc.txt"))))
					{
						files.push({
							name: item.name.replace(/\.owc\.txt$/i, ""),
							type: type,
							id: item.id,
							lastModified: new Date(item.lastModifiedDateTime)
						});
					}
				}
				resolve(files);
			},
			owc.cloud.oneDrive._handleError
		)),
		getBreadcrumps: (folderId = owc.cloud.oneDrive.ROOT_FOLDER_ID, _breadcrumps = []) => {
			function _queryFolder (folderId)
			{
				return new Promise((resolve) =>
				{
					if (!!owc.cloud.oneDrive.cache[folderId])
					{
						resolve(owc.cloud.oneDrive.cache[folderId]);
					}
					else
					{
						onedriveApi.getItemMeta(folderId, true).then(
							(result) => {
								let data = {
									id: result.id,
									name: result.name,
									parentId: result.parentReference.id
								};
								owc.cloud.oneDrive.cache[folderId] = data;
								resolve(data);
							},
							owc.cloud.oneDrive._handleError
						);
					}
				});
			};
			return new Promise((resolve, reject) =>
			{
				_queryFolder(folderId).then((folderData) =>
				{
					_breadcrumps.splice(0, 0, {name: (!!folderData.parentId) ? folderData.name : "Home", id: folderData.id});
					if (!!folderData.parentId)
					{
						owc.cloud.oneDrive.getBreadcrumps(folderData.parentId, _breadcrumps).then(resolve);
					}
					else
					{
						resolve(_breadcrumps);
					}
				},
				owc.cloud.oneDrive._handleError)
			});
		},
		loadFile: (fileId) => {
			owc.ui.wait("Loading from Microsoft OneDrive");
			return onedriveApi.loadFile(fileId).then(
				(fileContent) => owc.fileIo.loadWarbandCode(fileContent),
				owc.cloud.oneDrive._handleError
			);
		},
		saveFile: (parentFolderId) => {
			owc.ui.wait("Saving to OneDrive");
			let warbandCode = owc.getWarbandCode(true);
			let fileName = owc.fileIo.getFileName();
			return onedriveApi.saveToFile(warbandCode, fileName, parentFolderId).then(
				(response) => {
					owc.ui.notify("Warband successfully saved to OneDrive.");
					owc.ui.waitEnd();
				},
				owc.cloud.oneDrive._handleError
			);
		},
		_handleError: (error) => {
			owc.ui.waitEnd();
			owc.cloud.oneDrive.getSigninStatus().then((isSignedIn) =>
				{
					if (isSignedIn !== true)
					{
						owc.ui.notify("You are not signed in.", "yellow");
						fileSurfer.unregisterService();
						fileSurfer.renderNotsignedin();
					}
					else
					{
						owc.ui.notify("Something went wrong.", "red");
						/* if we are not in the root folder, we assume to query an invalid resource, so we go to root. */
						if ((fileSurfer.currentFolderId !== owc.cloud.oneDrive.ROOT_FOLDER_ID) && (fileSurfer.reRoot !== true))
						{
							fileSurfer.reRoot = true;
							console.info("Trying to go to the root folder.")
							fileSurfer.listFolderContent("root");
						}
						else
						{
							owc.cloud.oneDrive.cache = {};
							fileSurfer._listCurrentContent();
							fileSurfer.reRoot = false;
							// fileSurfer.currentFolderId = null;
							// fileSurfer.renderNotsignedin();
						}
					}
				}
			);
		}
	},
	googleDrive: {
		TITLE: "Google Drive",
		FA_ICON: "fab fa-google-drive",
		ROOT_FOLDER_ID: "root",
		cache: {},
		signIn: () => {},
		signOut: () => {},
		getSigninStatus: null,
		getFolderContent: (folderId = owc.cloud.googleDrive.ROOT_FOLDER_ID) => new Promise((resolve) => resolve()),
		getBreadcrumps: (folderId = owc.cloud.googleDrive.ROOT_FOLDER_ID, _breadcrumps = []) => new Promise((resolve) => resolve()),
		loadFile: (fileId) => new Promise((resolve) => resolve()),
		saveFile: (parentFolderId) => new Promise((resolve) => resolve()),
		_handleError: (error) => {}
	}
};

function http (method, url, headers = {}, body = null, responseType = "")
{
	return new Promise((resolve, reject) =>
	{
		let httpRequest = new XMLHttpRequest();
		httpRequest.open(method, url);
		for (let headerKey in headers)
		{
			httpRequest.setRequestHeader(headerKey, headers[headerKey]);
		};
		httpRequest.responseType = responseType;
		httpRequest.onloadend = (httpEvent) => {
			if ((httpEvent.target.status >= 200) && (httpEvent.target.status <= 299))
			{
				resolve(httpEvent.target);
			}
			else
			{
				console.error("HTTP", method, url, httpEvent.target);
				reject(httpEvent.target);
			}
		};
		httpRequest.send(body);
	});
};

owc.stats.componentsLoaded.set("fileio");
