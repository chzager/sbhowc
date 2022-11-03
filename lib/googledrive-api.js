let googledriveApi = {
	API_KEY: "AIzaSyBzd5Y9QONp-jeV84091VzJzF_UehUUZuI",
	CLIENT_ID: "133511192954-3p7vlira2fhkeaj15i4f9llh6t5od7dr.apps.googleusercontent.com",
	SCOPES: "https://www.googleapis.com/auth/drive.file",
	REDIRECT_URI: window.location.origin + window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1) + "re_google.html",
	accessToken: null,
	tokenCookie: {
		KEY: "gdauth",
		set: (token, expires) =>
		{
			document.cookie = googledriveApi.tokenCookie.KEY + "=" + token + "; path=/; expires=" + expires.toUTCString() + "; " + ((document.location.protocol.toLowerCase() === "https") ? "secue; " : "SameSite=Strict; ");
		},
		getToken: () =>
		{
			let cookieMatch = (new RegExp(googledriveApi.tokenCookie.KEY + "=([^&]+)")).exec(document.cookie);
			googledriveApi.accessToken = (!!cookieMatch) ? cookieMatch[1] : null;
			return googledriveApi.accessToken;
		},
		clear: () =>
		{
			let expiration = new Date();
			document.cookie = googledriveApi.tokenCookie.KEY + "=; path=/; expires=" + expiration.toUTCString() + "; " + ((document.location.protocol.toLowerCase() === "https") ? "secue; " : "SameSite=Strict; ");
			googledriveApi.accessToken = null;
		}
	},
	signIn: () =>
	{
		const AUTHSERVICE_URI = "https://accounts.google.com/o/oauth2/auth";
		if (googledriveApi.getSigninStatus() !== true)
		{
			let nonce = Math.round((0.1 + Math.random()) * 1e16).toString(16); // random string
			location.replace(AUTHSERVICE_URI +
				"?client_id=" + googledriveApi.CLIENT_ID +
				"&response_type=" + encodeURIComponent("permission id_token") +
				"&redirect_uri=" + encodeURIComponent(googledriveApi.REDIRECT_URI) +
				"&scope=" + encodeURIComponent(googledriveApi.SCOPES) +
				"&nonce=" + nonce
				+ "&include_granted_scopes=false"
			);
		}
	},
	signOut: () =>
	{
		googledriveApi.tokenCookie.clear();
	},
	disconnectApp: () =>
	{
		http("GET", "https://accounts.google.com/o/oauth2/revoke?token=" + encodeURIComponent(googledriveApi.accessToken)).then(console.log, console.error);
		googledriveApi.signOut();
	},
	getSigninStatus: () => new Promise((resolve) => resolve(!!googledriveApi.tokenCookie.getToken())),
	getItemMeta: (itemId, silent = false) => new Promise((resolve, reject) =>
		googledriveApi._query({
			method: "GET",
			url: "/drive/v3/files/" + itemId +
				"?fields=" + encodeURIComponent("id, name, parents"),
			silent: silent
		}).then(resolve, reject)
	),
	getItemIdByName: (fileName, folderId) => new Promise((resolve, reject) =>
		googledriveApi._query({
			method: "GET",
			url: "/drive/v3/files" +
				"?q=" + encodeURIComponent("'" + folderId + "' in parents and name = '" + fileName + "' and trashed = false") +
				"&fields=files(id)"
		}).then((response) => { resolve((response.files.length !== 0) ? response.files[0].id : null); }, reject)
	),
	getFolderContent: (folderId) => new Promise((resolve, reject) =>
		googledriveApi._query({
			method: "GET",
			url: "/drive/v3/files" +
				"?q=" + encodeURIComponent("'" + folderId + "' in parents and (name contains '.owc.txt' or mimeType = 'application/vnd.google-apps.folder') and trashed = false") +
				"&fields=" + encodeURIComponent("nextPageToken, files(id, name, mimeType, modifiedTime)")
		}).then(resolve, reject)
	),
	createFolder: (folderName, parentFolderId, description) => new Promise((resolve, reject) =>
	{
		let metadata = {
			name: folderName,
			mimeType: "application/vnd.google-apps.folder",
			description: description,
			parents: [parentFolderId]
		};
		let data = new FormData();
		data.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
		googledriveApi._query({
			method: "POST",
			url: "https://www.googleapis.com/upload/drive/v3/files",
			body: data
		}).then((response) => { resolve(response.id); });
	}),
	loadFile: (fileId) => new Promise((resolve, reject) =>
		googledriveApi._query({
			method: "GET",
			url: "/drive/v3/files/" + fileId +
				"?alt=media" +
				"&source=downloadUrl",
			parseResponseAsJson: false
		}).then(resolve, reject)
	),
	saveFile: (file, parentFolderId) => new Promise((resolve, reject) =>
	{
		googledriveApi.getItemIdByName(file.name, parentFolderId).then((fileId) =>
		{
			let method = (!!fileId) ? "PUT" : "POST";
			let url = "https://www.googleapis.com/upload/drive" + ((!!fileId) ? "/v2/files/" + fileId : "/v3/files") + "/?uploadType=multipart";
			let metadata = {
				name: file.name,
				mimeType: "text/plain",
				parents: [parentFolderId]
			};
			let data = new FormData();
			data.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
			data.append("file", file);
			googledriveApi._query({
				method: method,
				url: url,
				body: data
			}).then(resolve, reject);
		});
	}),
	_query: (query) =>
	{
		const GOOGLEAPI_URL = "https://www.googleapis.com";
		return new Promise((resolve, reject) =>
		{
			if (!!googledriveApi.accessToken)
			{
				if (!query.headers)
				{
					query.headers = {};
				}
				query.headers["Authorization"] = "Bearer " + googledriveApi.accessToken;
				xhr(query.method, (query.url.startsWith("https://") ? query.url : GOOGLEAPI_URL + query.url), query.headers, query.body).then(
					(response) => resolve(response),
					(reason) => (query.silent === true) ? null : reject(reason)
				);
			}
			else
			{
				reject(new Error("You are not signed in."));
			}
		});
	}
};
