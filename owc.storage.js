"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.storage =
{
	"VERSION_KEY": "owc.version"
};

owc.storage.init = function ()
{
	/* eventually we need to update items */
	if ((!!localStorage) && (localStorage.getItem(owc.storage.VERSION_KEY) !== owc.meta.VERSION))
	{
		for (let key in localStorage)
		{
			if (typeof localStorage[key] === "string")
			{
				if ((owc.isPid(key)) && (typeof localStorage[key].hash !== "number"))
				{
					/* change Feb21 release: figure-count and points are no longer part of the title string; added hash */
					let storedData = JSON.parse(localStorage[key]);
					let titleComponents = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData.title);
					if (titleComponents !== null)
					{
						storedData["title"] = titleComponents[1];
						storedData["figure-count"] = Number(titleComponents[2]);
						storedData["points"] = Number(titleComponents[3]);
						storedData["hash"] = owc.storage.hash(storedData.data);
						localStorage.removeItem(key);
						localStorage.setItem(key, JSON.stringify(storedData));
					};
				}
				else if (key === "owcSettings")
				{
					/* change Feb21 release: "owcSettings" is now "owc.settings" */
					let storedData = localStorage[key];
					localStorage.removeItem(key);
					localStorage.setItem(owc.settings.STORAGE_KEY, storedData);
				};
			};
		};
		localStorage.setItem(owc.storage.VERSION_KEY, owc.meta.VERSION);
	};
};

owc.storage.hash = function (string)
{
	/* This is based on https://github.com/darkskyapp/string-hash
	Since the basic code is public domain, this function is public domain as well.
	 */
	let hash,
	i = string.length;
	while (i)
	{
		hash = (hash * 33) ^ string.charCodeAt(--i);
	};
	return hash >>> 0;
};

owc.storage.store = function (key, title, data)
{
	if (!!localStorage)
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

owc.storage.retrieve = function (key)
{
	let result = null;
	if (!!localStorage)
	{
		let storedData = JSON.parse(localStorage.getItem(key));
		result = storedData;
		if (!!storedData)
		{
			result["date"] = new Date(storedData.date);
		};
	};
	return result;
};

owc.storage.storeWarband = function ()
{
	let warbandCode = owc.warband.toString();
	/* do not store an empty warband (#17) */
	if (owc.warband.isEmpty === false)
	{
		let data =
		{
			"title": owc.helper.nonBlankWarbandName(),
			"figure-count": owc.warband.figureCount,
			"points": owc.warband.points,
			"data": warbandCode,
			"hash": owc.storage.hash(warbandCode),
			"date": (new Date()).toISOString()
		};
		localStorage.setItem(owc.pid, JSON.stringify(data));
	};
};

owc.storage.restoreWarband = function (pid = owc.pid)
{
	let result = false;
	let storedData = JSON.parse(localStorage.getItem(pid));
	if ((!!storedData) && (storedData.data !== ""))
	{
		owc.warband.fromString(storedData.data, owc.resources.data);
		owc.ui.notify("Warband restored.");
		owc.setPid(pid);
		result = true;
	};
	return result;
};
