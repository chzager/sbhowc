"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var restorer = {};

restorer.sort =
{
	"field": "last-modified",
	"direction": 1
};

restorer.show = function ()
{
	owc.ui.showBluebox(document.getElementById("restorer"));
	restorer.listStoredData();
};

restorer.close = () => owc.ui.sweepVolatiles();

restorer.getSelectedPid = function ()
{
	let selectedItem = document.getElementById("restorer-table-frame").querySelector(".selected");
	return (!!selectedItem) ? selectedItem.getAttribute("data-id") : null;
};

restorer.storageItemClick = function (clickEvent)
{
	let selectedItem = document.getElementById("restorer-table-frame").querySelector(".selected");
	if (!!selectedItem)
	{
		selectedItem.classList.remove("selected");
	};
	clickEvent.target.closest("tr[data-id]").classList.add("selected");
};

restorer.restoreClick = function (clickEvent)
{
	let selectedPid = restorer.getSelectedPid();
	if (!!selectedPid)
	{
		restorer.close();
		owc.storage.restoreWarband(selectedPid);
		owc.ui.printWarband();
	};
};

restorer.discardClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	let selectedPid = restorer.getSelectedPid();
	if (!!selectedPid)
	{
		localStorage.removeItem(selectedPid);
		let deletedBubble = document.getElementById("deletedBubble");
		deletedBubble.style.left = Math.floor(document.querySelector("#restorer input[value=\"discard\"]").getBoundingClientRect().x - document.getElementById("restorer").getBoundingClientRect().x) + "px";
		owc.ui.showNotification(deletedBubble);
		restorer.listStoredData();
	};
};

restorer.tableheaderClick = function (clickEvent)
{
	let sortField = clickEvent.target.getAttribute("data-sortfield");
	if (restorer.sort.field === sortField)
	{
		restorer.sort.direction = restorer.sort.direction * -1;
	}
	else
	{
		restorer.sort.field = sortField;
		restorer.sort.direction = 1;
	};
	restorer.listStoredData();
};

restorer.listStoredData = function ()
{
	function _naturalPast(pastDate)
	{
		const wordings = ["just now", "{{n}} minutes ago", "{{6}} hours ago"];
		const dayWordings = ["today", "yesterday", "two days ago"];
		let result = "";
		let now = new Date();
		let maxHours = Number(/\{{2}(\d+)\}{2}/.exec(wordings[2])[1]);
		let secondsDiff = (now.getTime() - pastDate.getTime()) / 1000;
		let diff =
		{
			"minutes": secondsDiff / 60,
			"hours": secondsDiff / 60 / 60,
			"days": Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate())) / (1000 * 60 * 60 * 24))
		};
		if (secondsDiff < 60)
		{
			result = wordings[0];
		}
		else if (diff.minutes < 60)
		{
			result = wordings[1].replace(/\{{2}.\}{2}/, Math.floor(diff.minutes));
		}
		else if (diff.hours < maxHours)
		{
			result = wordings[2].replace(/\{{2}.\}{2}/, Math.floor(diff.hours));
		}
		else if (diff.days < dayWordings.length)
		{
			result = dayWordings[diff.days] + " " + pastDate.toIsoFormatText("HN");
		}
		else
		{
			result = pastDate.toIsoFormatText();
		};
		return result;
	};
	function _getLocalStorageData()
	{
		let result = [];
		for (let key in localStorage)
		{
			if (/^(?=\D*\d)[\d\w]{6}$/.test(key) === true)
			{
				let storedData = JSON.parse(localStorage[key]);
				let lastModifiedDate = new Date().fromIsoString(storedData.date);
				result.push(
				{
					"pid": key,
					"warband-name": storedData.title,
					"figure-count": storedData["figure-count"],
					"points": storedData.points,
					"last-modified": lastModifiedDate,
					"last-modified-text": _naturalPast(lastModifiedDate)
				}
				);
			};
		};
		switch (restorer.sort.field)
		{
		case "warband-name":
			result.sort((a, b) => (a["warband-name"].localeCompare(b["warband-name"]) * restorer.sort.direction));
			break;
		default:
			result.sort((a, b) => (((a[restorer.sort.field] < b[restorer.sort.field]) ? 1 : -1) * restorer.sort.direction));
		};
		return result;
	};
	let refNode = document.getElementById("restorer-table-frame");
	let variables =
	{
		"cached-warbands": _getLocalStorageData()
	};
	const thresholdWidth = 400;
	let snippetName = (Number(document.body.clientWidth) <= thresholdWidth) ? "table-frame-small" : "table-frame-normal";
	refNode.removeAllChildren();
	refNode.appendChild(pageSnippets.restorer[snippetName].produce(restorer, variables));
};
