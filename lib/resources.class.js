"use strict";

class Resources
{
	import(resourceJson, asScope = null)
	{
		for (let key in resourceJson)
		{
			if (this.hasOwnProperty(key) === false)
			{
				this[key] = resourceJson[key];
				if (asScope !== null)
				{
					this[key]["scope"] = asScope;
				};
			}
			else
			{
				console.group("Duplicate resource identifier");
				console.log("Resource key:", key);
				console.log("Existing resource:", this[key]);
				console.log("Resource to import:", resourceJson[key]);
				console.groupEnd("Duplicate resource identifier");
				throw "Duplicate resource identifier \"" + key + "\"";
			};
		};
		this._manageCrossreferences();
	};

	_manageCrossreferences()
	{
		function copyAllReferences(propertyName, referredResource, key, referredKey, values)
		{
			if (referredResource[propertyName] === undefined)
			{
				referredResource[propertyName] = [];
			};
			let v = 0, valuesCount = values.length;
			for (v; v < valuesCount; v += 1)
			{
				let referredValue = values[v];
				if ((referredValue !== referredKey) && (referredResource[propertyName].includes(referredValue) === false))
				{
					referredResource[propertyName].push(referredValue);
				};
				if (referredResource[propertyName].includes(key) === false)
				{
					referredResource[propertyName].push(key);
				};
			};
		};
		let propertyNames = ["replaces", "exclusive"];
		for (let key in this)
		{
			let resource = this[key];
			let p = 0, propertyNamesCount = propertyNames.length;
			for (p; p < propertyNamesCount; p += 1)
			{
				let propertyName = propertyNames[p];
				if (resource[propertyName] !== undefined)
				{
					let r = 0, resourceCount = resource[propertyName].length;
					for (r; r < resourceCount; r += 1)
					{
						let referredKey = resource[propertyName][r];
						let referredResource = this[referredKey];
						if (referredResource !== undefined)
						{
							copyAllReferences(propertyName, referredResource, key, referredKey, resource[propertyName]);
						};
					};
				};
			};
		};
	};

	defaultText(resourceId)
	{
		let result = this[resourceId]["en"];
		return result;
	};
	
	translate(resourceId, toLanguage, placeholders)
	{
		let result = "";
		let resource = this[resourceId];
		if (resource !== undefined)
		{
			result = resource[toLanguage];
			if (result === undefined)
			{
				console.warn("Language \"" + toLanguage + "\" not defined for resource \"" + resourceId + "\":", resource);
				result = this.defaultText(resourceId);
			};
			if (placeholders !== undefined)
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
