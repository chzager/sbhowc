"use strict";

owc.resources = {};

owc.resources.DEFAULT_LANGUAGE = "en";
owc.resources.data = {};
owc.resources.loadedUrls = [];

owc.resources.import = function (urls, callback)
{
	function _append(json)
	{
		let currentLang = json.lang || owc.resources.DEFAULT_LANGUAGE;
		let currentScope = json.scope;
		for (let key in json.data)
		{
			if (owc.resources.data.hasOwnProperty(key) === false)
			{
				owc.resources.data[key] = {};
			};
			if (owc.resources.data[key].hasOwnProperty(currentLang) === false)
			{
				if (typeof json.data[key] === "object")
				{
					for (let prop in json.data[key])
					{
						if (prop === "text")
						{
							owc.resources.data[key][currentLang] = json.data[key]["text"];
						}
						else
						{
							owc.resources.data[key][prop] = json.data[key][prop];
						};
					};
				}
				else
				{
					owc.resources.data[key][currentLang] = json.data[key];
				};
				if (typeof currentScope !== "undefined")
				{
					owc.resources.data[key]["scope"] = currentScope;
				};
			}
			else
			{
				console.group("Duplicate resource identifier");
				console.log("Resource key:", key);
				console.log("Existing resource:", owc.resources.data[key]);
				console.log("Resource to import:", json.data[key]);
				console.groupEnd("Duplicate resource identifier");
				throw "Duplicate resource identifier \"" + key + "\"";
			};
		};
	};
	function _loaderCallback(url, data)
	{
		owc.resources.loadedUrls.push(url);
		urlsToGo -= 1;
		if (data !== null)
		{
			_append(data);
		};
		if ((urlsToGo === 0) && (typeof callback !== "undefined"))
		{
			_manageCrossreferences();
			callback();
		};
	};
	function _manageCrossreferences()
	{
		function __copyAllReferences(originResourceKey, referredResourceKey, attribute)
		{
			let originResource = owc.resources.data[originResourceKey];
			let referredResource = owc.resources.data[referredResourceKey];
			if (referredResource[attribute] === undefined)
			{
				referredResource[attribute] = [];
			};
			if (referredResource[attribute].includes(originResourceKey) === false)
			{
				referredResource[attribute].push(originResourceKey);
			};
			for (let r = 0, rr = originResource[attribute].length; r < rr; r += 1)
			{
				let referredValue = originResource[attribute][r];
				if ((referredValue !== referredResourceKey) && (referredResource[attribute].includes(referredValue) === false))
				{
					referredResource[attribute].push(referredValue);
				};
			};
		};
		const attributes = ["replaces", "exclusive"];
		for (let key in owc.resources.data)
		{
			let originResource = owc.resources.data[key];
			for (let p = 0, pp = attributes.length; p < pp; p += 1)
			{
				let attribute = attributes[p];
				if (originResource[attribute] !== undefined)
				{
					for (let r = 0, rr = originResource[attribute].length; r < rr; r += 1)
					{
						__copyAllReferences(key, originResource[attribute][r], attribute);
					};
				};
			};
		};
	};
	let urlsToGo = urls.length;
	for (let u = 0, uu = urls.length; u < uu; u += 1)
	{
		if (owc.resources.loadedUrls.includes(urls[u]) === false)
		{
			fileIo.fetchServerFile(urls[u], _loaderCallback);
		}
		else
		{
			_loaderCallback(urls[u], null);
		};
	};
};

owc.resources.defaultText = function (resourceId)
{
	return owc.resources.data[resourceId][owc.resources.DEFAULT_LANGUAGE];
};

owc.resources.translate = function (resourceId, toLanguage, placeholders)
{
	let result = "";
	let resource = owc.resources.data[resourceId];
	if (typeof resource !== "undefined")
	{
		result = resource[toLanguage];
		if ((typeof result === "undefined") || (result === ""))
		{
			console.warn("Language \"" + toLanguage + "\" not defined for resource \"" + resourceId + "\":", resource);
			result = owc.resources.defaultText(resourceId);
		};
		if (typeof placeholders !== "undefined")
		{
			for (let key in placeholders)
			{
				result = result.replace("{" + key + "}", placeholders[key]);
			};
		};
	}
	else
	{
		console.warn("Undefined resource \"" + resourceId + "\"");
		console.trace();
		result = resourceId;
	};
	return result;
};
