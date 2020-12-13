"use strict";

// window.addEventListener("click", clickEventHandler);
window.addEventListener("dht", dhtEventHandler);

function dhtEventHandler(evt)
{
	console.log(evt.detail.originalEvent);
/*	switch (evt.detail.originalEvent.type)
	{
		case "click":
		
	// console.log(evt);
*/
};

function trClick(clickEvent)
{
	console.log("trClick", clickEvent);
};

function clickEventHandler(evt)
{
	let evtNode = evt.target;
	console.log(evt, evtNode);
	// console.log(evtNode.parentElement.querySelector("td[data-id]"));
	if (evtNode.parentElement !== null)
	{
		if ((evtNode.parentElement.tagName === "TR") && (evtNode.parentElement.getAttribute("data-id") !== null))
		{
	console.log(evtNode.parentElement);
		};
	};
	// if (evtNode.tagName === "TD"
};

function listStoredData(refNode)
{
	console.log("listStoredData()");
	let storedData = getLocalStorageData();
	for (let i = 0; i < storedData.length; i += 1)
	{
		let data = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData[i].title);
		let variables =
		{
			"pid": storedData[i].pid,
			"warband-name": data[1],
			"figure-count": data[2],
			"points": data[3],
			"last-modified": storedData[i].date
		};
		refNode.appendChild(d.generate(window, "table-row", variables));
	};
};

function getLocalStorageData()
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
/*
let storedData = getLocalStorageData();
let targetTBody = document.querySelector("tbody");
for (let d = 0; d < storedData.length; d += 1)
{
	let tr = dhtml.createNode("tr");
	let title = /^(.*)\[{2}([\d]+);([\d]+)\]{2}$/.exec(storedData[d].title);
	tr.appendChild(dhtml.createNode("td", "", {}, storedData[d].pid));
	tr.appendChild(dhtml.createNode("td", "", {}, title[1]));
	tr.appendChild(dhtml.createNode("td", "", {}, title[2]));
	tr.appendChild(dhtml.createNode("td", "", {}, title[3]));
	tr.appendChild(dhtml.createNode("td", "", {}, storedData[d].date));
	targetTBody.appendChild(tr);
};
*/

console.log("(i) restore.js loaded");