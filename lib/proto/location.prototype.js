Location.prototype.plainLocation = function ()
{
	let result = /[^?#]+/.exec(this.href)[0];
	return result;
};

Location.prototype.plainPath = function ()
{
	let plainLocation = this.plainLocation();
	return plainLocation.substring(0, plainLocation.lastIndexOf("/") + 1);
};

Location.prototype.getParam = function (paramName, defaultValue = "")
{
	let result = defaultValue;
	let regexFind = RegExp("[?&]" + paramName + "=([^&]+)").exec(this.search);
	if (regexFind !== null)
	{
		result = decodeURI(regexFind[1]);
	}
	return result;
};

Location.prototype.getAllParams = function ()
{
	let result = {};
	let search = this.search;
	let paramsRegex = /[?&]([^=]+)=([^&]+)?/g;
	let paramsFind;
	while (paramsFind = paramsRegex.exec(search))
	{
		result[paramsFind[1]] = decodeURI(paramsFind[2]);
	}
	return result;
};

Location.prototype.setParams = function (paramsJson, keep = [])
{
	let result = "";
	let urlPath = this.plainLocation();
	let search = String(this.search);
	for (let pramKey of keep)
	{
		if (paramsJson.hasOwnProperty(pramKey) === false)
		{
			let paramValue = this.getParam(pramKey);
			if (paramValue !== "")
			{
				paramsJson[pramKey] = paramValue;
			}
		}
	}
	let newSearch = "?";
	for (let paramKey in paramsJson)
	{
		if (newSearch !== "?")
		{
			newSearch += "&";
		}
		newSearch += paramKey + "=" + encodeURI(paramsJson[paramKey]);
	}
	return urlPath + newSearch;
};
