"use strict";

console.log("lsrestore.js");

function lsrestoreMain(obj)
{
	console.log("lsrestoreMain()", obj);
	let lsrestorer = new Restorer();
	let node = obj.generate(lsrestorer, "main");
	document.getElementById("d").appendChild(node);
};

class Restorer
{
	storageItemClick(clickEvent)
	{
		console.log("storageItemClick", clickEvent);
		let pid = clickEvent.target.parentElement.getAttribute("data-id");
		window.alert(pid);
	};

	deleteClick(clickEvent, origin)
	{
		console.log("deleteClick", clickEvent, origin, origin.constructor.name);
		clickEvent.stopPropagation();
		// localStorage
		origin.listStoredData(document.getElementById("lsrestore-tbody"));
	};
	
	closeClick(clickEvent)
	{
		console.log("closeClick");
	};
	
	listStoredData(refNode)
	{
		console.log("listStoredData()", refNode, this, this.constructor.name);
		let storedData = this.getLocalStorageData();
		while(refNode.firstChild !== null)
		{
			refNode.removeChild(refNode.firstChild);
		};
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
			refNode.appendChild(d.generate(this, "table-row", variables));
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
