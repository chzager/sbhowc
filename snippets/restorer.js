"use strict";

var restorer = {};

restorer.show = function ()
{
	if (document.getElementById("restorer") === null)
	{
		document.body.appendChild(pageSnippets.produceFromSnippet("restorer", restorer));
	};
	restorer.listStoredData();
	ui.showBox(document.getElementById("restorer"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
};

restorer.storageItemClick = function (clickEvent)
{
	let pid = clickEvent.target.parentElement.getAttribute("data-id");
	window.alert(pid);
};

restorer.deleteClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	let pid = clickEvent.target.getParentByTagName("tr").getAttribute("data-id");
	localStorage.removeItem(pid);
	restorer.listStoredData();
};

restorer.closeClick = function (clickEvent)
{
	ui.sweepVolatiles();
};

restorer.listStoredData = function ()
{
	function _getLocalStorageData()
	{
		function compareFunct(a, b)
		{
			let result = -1;
			if (a.date < b.date)
			{
				result = 1;
			};
			return result;
		};
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
		result.sort(compareFunct);
		return result;
	};
	let refNode = document.getElementById("restorer-tbody");
	let storedData = _getLocalStorageData();
	refNode.removeAllChildred();
	for (let i = 0; i < storedData.length; i += 1)
	{
		let data = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData[i].title);
		let variables =
		{
			"pid": storedData[i].pid,
			"warband-name": data[1],
			"figure-count": data[2],
			"points": data[3],
			"last-modified": new Date().fromIsoString(storedData[i].date).toIsoFormatText()
		};
		refNode.appendChild(pageSnippets.produceFromSnippet("table-row", restorer, variables));
	};
};
