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
		result = regexFind[1];
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
		result[paramsFind[1]] = paramsFind[2];
	};
	return result;
};

Location.prototype.setParams = function (paramsJson, appendToExisting = true, reload = true)
{
	let result = "";
	let urlPath = window.location.plainLocation();
	let search = String(window.location.search);
	if (appendToExisting === true)
	{
		let params = window.location.getAllParams();
		for (let paramKey in params)
		{
			if (paramsJson.hasOwnProperty(paramKey) === false)
			{
				paramsJson[paramKey] = params[paramKey];
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
		newSearch += paramKey + "=" + paramsJson[paramKey];
	};
	result = urlPath + newSearch + window.location.hash;
	if (reload === true)
	{
		window.location.replace(result);
	};
	return result;
};
