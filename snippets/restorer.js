"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var restorer = {};

restorer.show = function ()
{
	if (document.getElementById("restorer") === null)
	{
		document.body.appendChild(pageSnippets.produce("restorer", restorer));
	};
	restorer.listStoredData();
	let restorerPanel = document.getElementById("restorer");
	owc.ui.showBluebox(restorerPanel);
};

restorer.storageItemClick = function (clickEvent)
{
	let pid = clickEvent.target.closest("[data-id]").getAttribute("data-id");
	owc.ui.sweepVolatiles();
	owc.setPid(pid);
};

restorer.deleteClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	let pid = clickEvent.target.closest("tr").getAttribute("data-id");
	localStorage.removeItem(pid);
	restorer.listStoredData();
};

restorer.closeClick = function (clickEvent)
{
	owc.ui.sweepVolatiles();
};

restorer.listStoredData = function ()
{
	function _getLocalStorageData()
	{
		let result = [];
		for (let key in localStorage)
		{
			if (/^(?=\D*\d)[\d\w]{6}$/.test(key) === true)
			{
				let data = JSON.parse(localStorage[key]);
				data["pid"] = key;
				result.push(data);
			};
		};
		result.sort((a, b) => (a.date < b.date) ? 1 : -1);
		return result;
	};
	let refNode = document.getElementById("restorer-table-frame");
	let variables =
	{
		"cached-warbands": []
	};
	for (let storedData of _getLocalStorageData())
	{
		let data = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData.title);
		if (data !== null)
		{
			variables["cached-warbands"].push(
			{
				"pid": storedData.pid,
				"warband-name": data[1],
				"figure-count": data[2],
				"points": data[3],
				"last-modified": new Date().fromIsoString(storedData.date).toIsoFormatText()
			}
			);
		};
	};
	const thresholdWidth = 400;
	let snippetName = (Number(document.body.clientWidth) <= thresholdWidth) ? "table-frame-small" : "table-frame-normal";
	refNode.removeAllChildren();
	refNode.appendChild(pageSnippets.produce(snippetName, restorer, variables));
};
