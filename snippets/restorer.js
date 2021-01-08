"use strict";

var restorer = {};

restorer.show = function ()
{
	let variables = {
		"snippet-name": restorer._snippetVariant("table-frame")
	};
	if (document.getElementById("restorer") === null)
	{
		document.body.appendChild(pageSnippets.produceFromSnippet("restorer", restorer, variables));
	};
	restorer.listStoredData();
	owc.ui.showElement(document.getElementById("restorer"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 10)) + "px", null, true);
};

restorer.storageItemClick = function (clickEvent)
{
	let pid = clickEvent.target.parentElement.getAttribute("data-id");
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
	refNode.removeAllChildren();
	for (let i = 0, ii = storedData.length; i < ii; i += 1)
	{
		let data = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData[i].title);
		if (data !== null)
		{
			let variables =
			{
				"pid": storedData[i].pid,
				"warband-name": data[1],
				"figure-count": data[2],
				"points": data[3],
				"last-modified": new Date().fromIsoString(storedData[i].date).toIsoFormatText()
			};
			refNode.appendChild(pageSnippets.produceFromSnippet(restorer._snippetVariant("table-row"), restorer, variables));
		};
	};
};

restorer._snippetVariant = function(snippetName)
{
	const thresholdWidth = 400;
	let result = snippetName;
	if (Number(document.body.clientWidth) <= thresholdWidth)
	{
		result += "-small";
	};
	console.log(result);
	return result;
};

