/**!
 * Google Drive File Picker Example
 * By Daniel Lo Nigro (http://dan.cx/)
 */

/* Modified by Suppenhuhn79 (https://github.com/Suppenhuhn79)
 */
 
var GoogleDrivePicker = function (options, callback)
{
	this.apiKey = options.apiKey;
	this.clientId = options.clientId;
	this.onSelect = options.onSelect;
	this.onCancel = options.onCancel;
	// Load the drive API
	gapi.client.setApiKey(this.apiKey);
	console.log("'Load the drive API'");
	gapi.client.load('drive', 'v2'); //, () => this._doAuth(true));
	gapi.load('picker', callback);
}

GoogleDrivePicker.prototype =
{
	open: function (view, title)
	{
		if (gapi.auth.getToken())
		{
			this._showPicker(view, title);
		}
		else
		{
			console.log("gapi.auth.getToken() failed on GoogleDrivePicker.open()");
			this._doAuth(false, () => this._showPicker(view, title));
		}
	},

	_showPicker: function (view, title)
	{
		var accessToken = gapi.auth.getToken()?.access_token;
		console.log("accessToken:", accessToken);
		if (accessToken)
		{
			this.picker = new google.picker.PickerBuilder().
				addView(view).
				enableFeature(google.picker.Feature.NAV_HIDDEN).
				setAppId(this.clientId).
				setOAuthToken(accessToken).
				setTitle(title).
				setCallback(this._pickerCallback.bind(this)).
				build().
				setVisible(true);
		}
	},

	_pickerCallback: function (data)
	{
		switch (data[google.picker.Response.ACTION])
		{
			case google.picker.Action.PICKED:
				gapi.client.drive.files.get({ fileId: data[google.picker.Response.DOCUMENTS][0][google.picker.Document.ID] }).execute(this.onSelect);
				break;
			case google.picker.Action.CANCEL:
				this.onCancel?.();
		}
	},

	_doAuth: function (immediate, callback)
	{
		console.log("doAuth()", immediate, callback);
		let auth = gapi.auth.authorize(
		{
			client_id: this.clientId + '.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.file',
			immediate: immediate
		}, (result) =>
			{ 
				console.log(result);
				if (!!result.error)
				{
					console.log("'error':", result.error);
				};
				callback(result);
			}
		);
		// console.log("doAuth() =:", auth);
	}
};
