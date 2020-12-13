"use strict";

// FileIo.fetchServerFile("table.xml", main);

let d = new Dhtml2("table.xml", main);

function main(obj)
{
	console.log("main()", obj);
	// let dht = data;
	// d = new Dhtml2(dht);
	let restorer = new Restorer();
	let node = d.generate(restorer, "main");
	document.getElementById("d").appendChild(node);
};

class Restorer
{
	trClick(clickEvent)
	{
		console.log("trClick", clickEvent);
		let pid = clickEvent.target.parentElement.getAttribute("data-id");
		window.alert(pid);
	};

	listStoredData(refNode)
	{
		console.log("listStoredData()");
		let storedData = this.getLocalStorageData();
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
