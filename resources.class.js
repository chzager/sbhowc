"use strict";

class Resources
{
	constructor()
	{
		this.defaultLanguage = "en";
		this.data = {};
		this.loadedUrls = [];
	};

	import(urls, callback)
	{
		let loadedUrls_ = this.loadedUrls;
		let defaultLanguage_ = this.defaultLanguage;
		let data_ = this.data;
		function append(json)
		{
			let currentLang = json.lang || defaultLanguage_;
			let currentScope = json.scope;
			for (let key in json.data)
			{
				if (data_.hasOwnProperty(key) === false)
				{
					data_[key] = {};
				};
				if (data_[key].hasOwnProperty(currentLang) === false)
				{
					if (typeof json.data[key] === "object")
					{
						for (let prop in json.data[key])
						{
							if (prop === "text")
							{
								data_[key][currentLang] = json.data[key]["text"];
							}
							else
							{
								data_[key][prop] = json.data[key][prop];
							};
						};
					}
					else
					{
						data_[key][currentLang] = json.data[key];
					};
					if (typeof currentScope !== "undefined")
					{
						data_[key]["scope"] = currentScope;
					};
				}
				else
				{
					console.group("Duplicate resource identifier");
					console.log("Resource key:", key);
					console.log("Existing resource:", data_[key]);
					console.log("Resource to import:", json.data[key]);
					console.groupEnd("Duplicate resource identifier");
					throw "Duplicate resource identifier \"" + key + "\"";
				};
			};
		};
		function loaderCallback(url, data)
		{
			if (data !== null)
			{
				loadedUrls_.push(url);
				append(data);
			};
			urls.splice(urls.indexOf(url), 1);
			if ((urls.length === 0) && (typeof callback !== "undefined"))
			{
				callback();
			};
		};
		let anyNewUrls = false;
		for (let u = 0; u < urls.length; u += 1)
		{
			if (this.loadedUrls.includes(urls[u]) === false)
			{
				Json.load(urls[u], loaderCallback);
				anyNewUrls = true;
			};
		};
		if (anyNewUrls === false)
		{
			callback();
		};
	};

	defaultText(resourceId)
	{
		let result = this.data[resourceId][this.defaultLanguage];
		return result;
	};

	translate(resourceId, toLanguage, placeholders)
	{
		let result = "";
		let resource = this.data[resourceId];
		if (typeof resource !== "undefined")
		{
			result = resource[toLanguage];
			if ((typeof result === "undefined") || (result === ""))
			{
				console.warn("Language \"" + toLanguage + "\" not defined for resource \"" + resourceId + "\":", resource);
				result = this.defaultText(resourceId);
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

};
