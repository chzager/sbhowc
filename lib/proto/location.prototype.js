"use strict";

Location.prototype.plainLocation = function ()
{
	let result = /[^?#]+/.exec(window.location.href)[0];
	return result;
};

Location.prototype.getParam = function (paramName, defaultValue = "")
{
	let result = defaultValue;
	let regexFind = RegExp("[?&]" + paramName + "=([^&]+)").exec(window.location.search);
	if (regexFind !== null)
	{
		result = decodeURI(regexFind[1]);
	}
	return result;
};

Location.prototype.getAllParams = function ()
{
	let result = {};
	let search = window.location.search;
	let paramsRegex = /[?&]([^=]+)=([^&]+)?/g;
	let paramsFind;
	while (paramsFind = paramsRegex.exec(search))
	{
		result[paramsFind[1]] = decodeURI(paramsFind[2]);
	};
	return result;
};

Location.prototype.setParams = function (paramsJson, keep = [])
{
	let result = "";
	let urlPath = window.location.plainLocation();
	let search = String(window.location.search);
	for (let pramKey of keep)
	{
		if (paramsJson.hasOwnProperty(pramKey) === false)
		{
			let paramValue = window.location.getParam(pramKey);
			if (paramValue !== "")
			{
				paramsJson[pramKey] = paramValue;
			};
		};
	};
	let newSearch = "?";
	for (let paramKey in paramsJson)
	{
		if (newSearch !== "?")
		{
			newSearch += "&";
		};
		newSearch += paramKey + "=" + encodeURI(paramsJson[paramKey]);
	};
	result = urlPath + newSearch + window.location.hash;
	return result;
};

Location.prototype.reloadWithParams = function (paramsJson, keep = [])
{
	window.location.replace(window.location.setParams(paramsJson, keep));
};
