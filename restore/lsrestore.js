"use strict";

function lsrestoreMain()
{
	let node = PageSnippets.produceFromSnippet("lsrestorer", Restorer);
	document.body.appendChild(node);
};

let Restorer = {};

Restorer.storageItemClick = function (clickEvent)
{
	let pid = clickEvent.target.parentElement.getAttribute("data-id");
	window.alert(pid);
};

Restorer.deleteClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	let pid = clickEvent.target.getParentByTagName("tr").getAttribute("data-id");
	localStorage.removeItem(pid);
	Restorer.listStoredData(document.getElementById("lsrestore-tbody"));
};

Restorer.closeClick = function (clickEvent)
{
	sweepVolatiles();
};

Restorer.listStoredData = function (refNode)
{
	function _getLocalStorageData()
	{
		function compareFunct(a, b)
		{
			let result = -1;
			if (a.data < b.data)
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
		refNode.appendChild(PageSnippets.produceFromSnippet("table-row", Restorer, variables));
	};
};

/*
function lsrestoreMain()
{
let lsrestorer = new Restorer();
let node = PageSnippets.produceFromSnippet("lsrestorer", lsrestorer);
document.getElementById("d").appendChild(node);
};

class Restorer
{
storageItemClick(clickEvent)
{
let pid = clickEvent.target.parentElement.getAttribute("data-id");
window.alert(pid);
};

deleteClick(clickEvent)
{
clickEvent.stopPropagation();
let pid = clickEvent.target.getParentByTagName("tr").getAttribute("data-id");
localStorage.removeItem(pid);
this.listStoredData(document.getElementById("lsrestore-tbody"));
};

closeClick(clickEvent)
{
sweepVolatiles();
};

listStoredData(refNode)
{
let storedData = this.getLocalStorageData();
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
refNode.appendChild(PageSnippets.produceFromSnippet("table-row", this, variables));
};
};

getLocalStorageData()
{
function compareFunct(a, b)
{
let result = -1;
if (a.data < b.data)
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
};
*/
