"use strict";

for (let key in localStorage)
{
	if (/^[0-9a-z]{6}$/.test(key) === true)
	{
		document.body.appendChild(dhtml.createNode("p", "", {}, key + ":" + localStorage[key]));
	}
};
