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
	loadWarbandCode: (warbandCode) =>
	{
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
	_notifyError: (error, message) =>
	{
		console.error(error);
		owc.ui.waitEnd();
		owc.ui.notify(message, "red");
	}
};

owc.cloud = {
	_handleError: (error) =>
	{
		owc.ui.waitEnd();
		fileSurfer.cloudService.getSigninStatus().then(
			(isSignedIn) =>
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
					if ((fileSurfer.currentFolderId !== fileSurfer.cloudService.ROOT_FOLDER_ID) && (fileSurfer.reRoot !== true))
					{
						fileSurfer.reRoot = true;
						console.debug("Trying to go to the root folder.");
						fileSurfer.listFolderContent(fileSurfer.cloudService.ROOT_FOLDER_ID);
					}
					else
					{
						fileSurfer.cloudService.cache = {};
						fileSurfer._listCurrentContent();
						fileSurfer.reRoot = false;
						// fileSurfer.currentFolderId = null;
						// fileSurfer.renderNotsignedin();
					}
				}
			},
			(reason) =>
			{
				owc.ui.notify("Something went terribly wrong.", "red");
				fileSurfer.cloudService.cache = {};
				fileSurfer.currentFolderId = null;
				console.error(reason);
			}
		);
	},
	setReminder: (provider) =>
	{
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
		signIn: () =>
		{
			owc.cloud.setReminder("oneDrive");
			fileSurfer.registerService("oneDrive");
			onedriveApi.signIn();
		},
		signOut: () =>
		{
			fileSurfer.unregisterService();
			onedriveApi.signOut();
		},
		getSigninStatus: onedriveApi.getSigninStatus,
		getFolderContent: (folderId = owc.cloud.oneDrive.ROOT_FOLDER_ID) => new Promise((resolve) => onedriveApi.getFolderContent(folderId).then(
			(result) =>
			{
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
			owc.cloud._handleError
		)),
		getBreadcrumps: (folderId = owc.cloud.oneDrive.ROOT_FOLDER_ID, _breadcrumps = []) =>
		{
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
							(result) =>
							{
								let data = {
									id: result.id,
									name: result.name,
									parentId: result.parentReference.id
								};
								owc.cloud.oneDrive.cache[folderId] = data;
								resolve(data);
							},
							owc.cloud._handleError
						);
					}
				});
			};
			return new Promise((resolve, reject) =>
			{
				_queryFolder(folderId).then((folderData) =>
				{
					_breadcrumps.splice(0, 0, { name: (!!folderData.parentId) ? folderData.name : "Home", id: folderData.id });
					if (!!folderData.parentId)
					{
						owc.cloud.oneDrive.getBreadcrumps(folderData.parentId, _breadcrumps).then(resolve);
					}
					else
					{
						resolve(_breadcrumps);
					}
				},
					owc.cloud._handleError);
			});
		},
		loadFile: (fileId) =>
		{
			owc.ui.wait("Loading from Microsoft OneDrive");
			return onedriveApi.loadFile(fileId).then(
				(fileContent) => owc.fileIo.loadWarbandCode(fileContent),
				owc.cloud._handleError
			);
		},
		saveFile: (parentFolderId) =>
		{
			owc.ui.wait("Saving to OneDrive");
			let warbandCode = owc.getWarbandCode(true);
			let fileName = owc.fileIo.getFileName();
			return onedriveApi.saveToFile(warbandCode, fileName, parentFolderId).then(
				(response) =>
				{
					owc.ui.notify("Warband successfully saved to OneDrive.");
					owc.ui.waitEnd();
				},
				owc.cloud._handleError
			);
		}
	},
	googleDrive: {
		TITLE: "Google Drive",
		FA_ICON: "fab fa-google-drive",
		ROOT_FOLDER_ID: "root",
		appFolder: {
			NAME: "Song of Blades and Heroes OWC Warbands",
			id: null
		},
		cache: {},
		signIn: () =>
		{
			owc.cloud.setReminder("googleDrive");
			fileSurfer.registerService("googleDrive");
			googledriveApi.signIn();
		},
		signOut: () =>
		{
			fileSurfer.unregisterService();
			googledriveApi.signOut();
		},
		getSigninStatus: googledriveApi.getSigninStatus,
		firstUse: async () =>
		{
			if (!owc.cloud.googleDrive.appFolder.id)
			{
				googledriveApi.getItemIdByName(owc.cloud.googleDrive.appFolder.NAME, "root").then(
					(result) =>
					{
						if (!!result)
						{
							owc.cloud.googleDrive.appFolder.id = result;
						}
						else
						{
							owc.ui.blurPage("dim stubborn");
							Menubox.dialogBox("Google Drive first use",
								"Seems to be the first time you use " + owc.meta.TITLE + " on Google Drive.\n" +
								"We will now create a folder to keep your warbands in one place.",
								[
									{ key: "continue", label: "create folder" },
									{ key: "cancel", label: "abort" }
								]
							).then((buttonKey) =>
							{
								if (buttonKey === "continue")
								{
									owc.ui.unblurPage();
									googledriveApi.createFolder(owc.cloud.googleDrive.appFolder.NAME, "root", owc.meta.ORIGIN).then(
										(result) =>
										{
											console.info("Google Drive folder created, id:", result);
											owc.cloud.googleDrive.appFolder.id = result;
											fileSurfer.listFolderContent(owc.cloud.googleDrive.appFolder.id);
										});
								}
								else
								{
									owc.ui.sweepVolatiles();
								}
							});
						}
					});
			}
		},
		complainNoPermission: () =>
		{
			owc.ui.blurPage("dim stubborn");
			Menubox.dialogBox("Google Drive permission required",
				"You need to grant the __\"See, edit, create, and delete only the specific Google Drive files you use with this app\"__ permission in order to use " + owc.meta.TITLE + " on your Google Drive.\n" +
				"See the [tos_pp.html#pp_cloud](Privacy Policy) why this is required.",
				[
					{ key: "retry", label: "try again" },
					{ key: "cancel", label: "cancel" }
				]
			).then((buttonKey) =>
			{
				owc.ui.sweepVolatiles();
				if (buttonKey === "retry")
				{
					owc.cloud.googleDrive.signIn();
				}
			});
		},
		getFolderContent: (folderId = owc.cloud.googleDrive.ROOT_FOLDER_ID) =>
		{
			owc.cloud.googleDrive.firstUse();
			return new Promise((resolve) => googledriveApi.getFolderContent(folderId).then(
				(result) =>
				{
					const FILE_TYPES = {
						'application/vnd.google-apps.folder': "folder",
						'text/plain': "file"
					};
					let files = [];
					for (let item of result.files)
					{
						let type = FILE_TYPES[item.mimeType];
						if ((type === "folder") || ((type === "file") && (item.name.endsWith(".owc.txt"))))
						{
							files.push({
								name: item.name.replace(/\.owc\.txt$/i, ""),
								type: type,
								id: item.id,
								lastModified: new Date(item.modifiedTime)
							});
						}
					}
					resolve(files);
				},
				owc.cloud._handleError)
			);
		},
		getBreadcrumps: (folderId = owc.cloud.googleDrive.ROOT_FOLDER_ID, _breadcrumps = []) =>
		{
			function _queryFolder (folderId)
			{
				return new Promise((resolve) =>
				{
					if (!!owc.cloud.googleDrive.cache[folderId])
					{
						resolve(owc.cloud.googleDrive.cache[folderId]);
					}
					else
					{
						googledriveApi.getItemMeta(folderId).then(
							(result) =>
							{
								let data = {
									id: result.id,
									name: result.name,
									parentId: (!!result.parents) ? result.parents[0] : null
								};
								owc.cloud.googleDrive.cache[folderId] = data;
								resolve(data);
							},
							(reason) =>
							{
								/* when we do not have access to an item, google returns a 404... */
								resolve({ id: "root" });
							}
						);
					}
				});
			};
			return new Promise((resolve, reject) =>
			{
				_queryFolder(folderId).then((folderData) =>
				{
					_breadcrumps.splice(0, 0, { name: (!!folderData.parentId) ? folderData.name : "Home", id: folderData.id });
					if (!!folderData.parentId)
					{
						owc.cloud.googleDrive.getBreadcrumps(folderData.parentId, _breadcrumps).then(resolve);
					}
					else
					{
						resolve(_breadcrumps);
					}
				},
					owc.cloud._handleError);
			});
		},
		loadFile: (fileId) =>
		{
			owc.ui.wait("Loading from Google Drive");
			return googledriveApi.loadFile(fileId).then(
				(fileContent) => owc.fileIo.loadWarbandCode(fileContent),
				owc.cloud._handleError);
		},
		saveFile: (parentFolderId) =>
		{
			owc.ui.wait("Saving to Google Drive");
			let file = owc.fileIo.getFile();
			return googledriveApi.saveFile(file, parentFolderId).then(
				(response) =>
				{
					owc.ui.notify("Warband successfully saved to Google Drive.");
					owc.ui.waitEnd();
					console.info("File saved.", response);
				},
				owc.cloud._handleError
			);
		}
	}
};

function xhr (method, url, headers = {}, body = null, responseType = "")
{
	return new Promise((resolve, reject) =>
	{
		let xhrReq = new XMLHttpRequest();
		let resContentType = undefined;
		xhrReq.open(method, url);
		for (let headerKey in headers)
		{
			xhrReq.setRequestHeader(headerKey, headers[headerKey]);
		};
		xhrReq.responseType = responseType;
		xhrReq.onreadystatechange = () =>
		{
			if (xhrReq.readyState === xhrReq.HEADERS_RECEIVED)
			{
				resContentType = /(\S+)\b/.exec(xhrReq.getResponseHeader("content-type"))[1];
			}
		};
		xhrReq.onloadend = (xhrEvt) =>
		{
			if ((xhrEvt.target.status >= 200) && (xhrEvt.target.status <= 299))
			{
				let response = xhrEvt.target.response;
				if (resContentType.includes("application/json"))
				{
					response = JSON.parse(response);
				}
				resolve(response);
			}
			else
			{
				let rejctReason = {
					status: xhrEvt.target.status,
					text: xhrEvt.target.statusText,
					response: xhrEvt.target.response
				};
				console.error("xhr", method, url, rejctReason);
				reject(rejctReason);
			}
		};
		xhrReq.send(body);
	});
};

owcStats.componentsLoaded.set("fileio");
