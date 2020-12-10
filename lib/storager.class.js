"use strict";

class Storager
{

	constructor()
	{
		this.available = (typeof localStorage !== "undefined");
		if (this.available === false)
		{
			console.warn("localStorage is not available. Storager refuses work.");
		};
	};

	store(key, title, data)
	{
		if (this.available === true)
		{
			let storeData =
			{
				"title": title,
				"data": data,
				"date": new Date().toISOString()
			};
			localStorage.setItem(key, JSON.stringify(storeData));
		};
	};

	retrieve(key)
	{
		let result;
		if (this.available === true)
		{
			let storedData = JSON.parse(localStorage.getItem(key));
			if (storedData !== null)
			{
				result = storedData;
				result["date"] = new Date().fromIsoString(storedData.date);
			};
		};
		return result;
	};

};
