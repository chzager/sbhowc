"use strict";

FileIo.fetchServerFile("table.xml", main);

let d;

function main(ulr, data)
{
	let dht = data;
	d = new Dhtml2(dht);
	let node = d.generate(window, "main");
	document.getElementById("d").appendChild(node);
};

function listStore(refNode)
{
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
