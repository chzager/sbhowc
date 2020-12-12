"use strict";

for (let key in localStorage)
{
	if (/^(?=\D*\d)[\d\w]{6}$/.test(key) === true)
	{
		document.body.appendChild(dhtml.createNode("p", "", {}, key + ":" + localStorage[key]));
	}
};
