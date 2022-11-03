/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let owcResources =
{
	DEFAULT_LANGUAGE: "en",
	data: {},
	loadedUrls: [],

	import: function (urls, callback)
	{
		function _allSettled (promises)
		{
			for (let promise of promises)
			{
				if (promise.status === "fulfilled")
				{
					_append(promise.value);
				}
				else
				{
					console.error(promise.reason);
				};
			};
			_manageCrossreferences();
		};
		function _append (json)
		{
			let currentLang = json.lang || owcResources.DEFAULT_LANGUAGE;
			let currentScope = json.scope;
			for (let key in json.data)
			{
				if (owcResources.data.hasOwnProperty(key) === false)
				{
					owcResources.data[key] = {};
				};
				if (owcResources.data[key].hasOwnProperty(currentLang) === false)
				{
					if (typeof json.data[key] === "object")
					{
						for (let prop in json.data[key])
						{
							if (prop === "text")
							{
								owcResources.data[key][currentLang] = json.data[key]["text"];
							}
							else
							{
								owcResources.data[key][prop] = json.data[key][prop];
							};
						};
					}
					else
					{
						owcResources.data[key][currentLang] = json.data[key];
					};
					if (!!currentScope)
					{
						owcResources.data[key]["scope"] = currentScope;
					};
				}
				else
				{
					console.warn("Duplicate resource identifier \"" + key + "\".",
						{
							"Existing resource": owcResources.data[key],
							"Data to import": json
						}
					);
				};
			};
		};
		function _manageCrossreferences ()
		{
			function __copyAllReferences (originResourceKey, referredResourceKey, attribute)
			{
				let originResource = owcResources.data[originResourceKey];
				let referredResource = owcResources.data[referredResourceKey];
				if (referredResource[attribute] === undefined)
				{
					referredResource[attribute] = [];
				};
				if (referredResource[attribute].includes(originResourceKey) === false)
				{
					referredResource[attribute].push(originResourceKey);
				};
				for (let referredValue of originResource[attribute])
				{
					if ((referredValue !== referredResourceKey) && (referredResource[attribute].includes(referredValue) === false))
					{
						referredResource[attribute].push(referredValue);
					};
				};
			};
			const attributes = ["replaces", "exclusive"];
			for (let key in owcResources.data)
			{
				let originResource = owcResources.data[key];
				for (let attribute of attributes)
				{
					if (originResource[attribute] !== undefined)
					{
						for (let originAttribute of originResource[attribute])
						{
							__copyAllReferences(key, originAttribute, attribute);
						};
					};
				};
			};
		};

		return new Promise((resolve, reject) =>
		{
			let executors = [];
			for (let url of urls)
			{
				if (owcResources.loadedUrls.includes(url) === false)
				{
					executors.push(fileIo.fetchServerFile(url));
					owcResources.loadedUrls.push(url);
				};
			};
			Promise.allSettled(executors).then((promises) =>
			{
				_allSettled(promises);
				resolve();
			}
			);
		}
		);
	},

	defaultText: function (resourceId, placeholders)
	{
		let result = owcResources.data[resourceId][owcResources.DEFAULT_LANGUAGE];
		for (let key in placeholders || {})
		{
			result = result.replace("{" + key + "}", placeholders[key]);
		};
		return result;
	},

	translate: function (resourceId, toLanguage, placeholders = {})
	{
		let result = "";
		let resource = owcResources.data[resourceId];
		if (!!resource)
		{
			result = resource[toLanguage];
			if ((typeof result === "undefined") || (result === ""))
			{
				console.warn("Language \"" + toLanguage + "\" not defined for resource \"" + resourceId + "\":", resource);
				result = owcResources.defaultText(resourceId);
			};
			for (let key in placeholders)
			{
				result = result.replace("{" + key + "}", placeholders[key]);
			};
		}
		else
		{
			console.warn("Undefined resource \"" + resourceId + "\"");
			console.trace();
			result = resourceId;
		};
		return result;
	}
};
