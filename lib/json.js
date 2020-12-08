"use strict";

class Json
{
	constructor()
	{
		throw new TypeError("Illegal constructor. This is a static class.");
	};

	static load(url, callback)
	{
		let httpRequest = new XMLHttpRequest();
		httpRequest.overrideMimeType("application/json");
		httpRequest.open("GET", url);
		httpRequest.onloadend = function (httpEvent)
		{
			let receivedData = null;
			if (httpEvent.target.status === 200)
			{
				try
				{
					receivedData = JSON.parse(httpEvent.target.responseText);
				}
				catch (ex)
				{
					console.error(ex);
				};
			}
			else
			{
				console.error("Getting \"" + url + "\" returned HTTP status code " + httpEvent.target.status);
			};
			callback(url, receivedData);
		};
		httpRequest.send();
	};

};
