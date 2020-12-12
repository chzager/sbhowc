"use strict";

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