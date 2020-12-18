"use strict";

class FileIo
{
	constructor()
	{
		throw new TypeError("Illegal constructor.");
	};

	static offerFileToClient(filename, data)
	{
		let anchorNode = document.createElement("a");
		anchorNode.style.display = "none";
		let file = new Blob([data],
		{
			type: "text/plain"
		}
			);
		anchorNode.href = URL.createObjectURL(file);
		anchorNode.download = String(filename).replace(/[^a-z0-9\s\-_.]/ig, "");
		document.body.appendChild(anchorNode);
		anchorNode.click();
		anchorNode.remove();
	};

	static requestClientFile(clickEvent, callback)
	{
		let inputNode = document.createElement("input");
		inputNode.setAttribute("type", "file");
		inputNode.setAttribute("accept", "text/plain");
		inputNode.style.display = "none";
		inputNode.onchange = function (fileEvent)
		{
			let fileReader = new FileReader();
			fileReader.onload = callback;
			fileReader.readAsText(fileEvent.target.files[0]);
		};
		document.body.appendChild(inputNode);
		inputNode.click();
		inputNode.remove();
	};

	static fetchServerFile(url, callback, autoRecognizeDataType = true)
	{
		let httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url);
		httpRequest.onloadend = function (httpEvent)
		{
			let result = null;
			if (httpEvent.target.status !== 200)
			{
				console.error("Getting \"" + url + "\" returned HTTP status code " + httpEvent.target.status);
			}
			else
			{
				result = httpEvent.target.responseText;
				if (autoRecognizeDataType === true)
				{
					let fileExt = /\.([^.]+)$/.exec(url.toLowerCase());
					if (fileExt !== null)
					{
						switch (fileExt[1])
						{
						case "json":
							result = JSON.parse(result);
							break;
						case "xml":
							result = new DOMParser().parseFromString(result, "text/xml");
							break;
						};
					};
				};
				callback(url, result);
			};
		};
		httpRequest.send();
	};

};
