const onedriveApi = {
	CLIENT_ID: "100cf703-977f-456e-8ff1-2e5365ae24a8",
	SCOPES: "user.read files.readwrite",
	REDIRECT_URI: window.location.origin + window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") +1) + "re_microsoft.html",
	accessToken: null,
	tokenCookie: {
		KEY: "odauth",
		set: (token, expires) => {
			document.cookie = onedriveApi.tokenCookie.KEY + "=" + token + "; path=/; expires=" + expires.toUTCString() + "; " + ((document.location.protocol.toLowerCase() === "https") ? "secue; " : "SameSite=Strict; ");
		},
		getToken: () => {
			let cookieMatch = (new RegExp(onedriveApi.tokenCookie.KEY + "=([^&]+)")).exec(document.cookie);
			onedriveApi.accessToken = (!!cookieMatch) ? cookieMatch[1] : null;
			return onedriveApi.accessToken;
		},
		clear: () => {
			let expiration = new Date();
			document.cookie = onedriveApi.tokenCookie.KEY + "=; path=/; expires=" + expiration.toUTCString() + "; " + ((document.location.protocol.toLowerCase() === "https") ? "secue; " : "SameSite=Strict; ");
			onedriveApi.accessToken = null;
		}
	},
	signIn: () => {
		if (onedriveApi.getSigninStatus() !== true)
		{
			location.replace("https://login.microsoftonline.com/common/oauth2/v2.0/authorize" +
				"?client_id=" + onedriveApi.CLIENT_ID +
				"&response_type=token" +
				"&redirect_uri=" + encodeURIComponent(onedriveApi.REDIRECT_URI) +
				"&scope=" + encodeURIComponent(onedriveApi.SCOPES)
			);
		}
	},
	signOut: () => {
		/* Logout is not meant to be called via AJAX (runs into CORS error) but with window.location.replace(). Still does not what I suppose it to.
		location.replace("https://login.microsoftonline.com/common/oauth2/v2.0/logout" +
			"?post_logout_redirect_uri=" + encodeURIComponent(window.location.origin + window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") +1))
		*/
		onedriveApi.tokenCookie.clear();
	},
	getSigninStatus: () => new Promise((resolve) => resolve(!!onedriveApi.tokenCookie.getToken())),
	getItemMeta: (itemId, silent = false) => new Promise((resolve, reject) =>
		onedriveApi._query({
			method: "GET",
			url: "/me/drive/items/" + itemId,
			silent: silent
		}).then(resolve, reject)
	),
	getFolderContent: (folderId) => new Promise((resolve, reject) =>
		onedriveApi._query({
			method: "GET",
			url: "/me/drive/items/" + folderId + "/children"
		}).then(resolve, reject)
	),
	loadFile: (fileId) => new Promise((resolve, reject) =>
		onedriveApi._query({
			method: "GET",
			url: "/me/drive/items/" + fileId + "/content",
			parseResponseAsJson: false
		}).then(resolve, reject)
	),
	saveToFile: (fileContent, fileName, parentFolderId) => new Promise((resolve, reject) =>
		onedriveApi._query({
			method: "PUT",
			url: "/me/drive/items/" + parentFolderId + ":/" + fileName +":/content",
			body: fileContent
		}).then(resolve, reject)
	),
	_query: (query) => {
		const MS_GRAPH_URL = "https://graph.microsoft.com/v1.0";
		return new Promise((resolve, reject) =>
		{
			if (!!onedriveApi.accessToken)
			{
				if (!query.headers)
				{
					query.headers = {};
				}
				query.headers["Authorization"] = "Bearer " + onedriveApi.accessToken;
				xhr(query.method, (query.url.startsWith("https://") ? query.url : MS_GRAPH_URL + query.url), query.headers, query.body).then(
					(response) => resolve(response),
					(reason) => (query.silent === true) ? null : reject(reason)
				);
			}
			else
			{
				reject(new Error("Not signed in."));
			}
		});
	}
};
