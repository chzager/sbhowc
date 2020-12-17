"use strict";

var warbandcode = {};

warbandcode.show = function ()
{
	if (document.getElementById("warbandcode") === null)
	{
		let variables =
		{
			"warbandcode": owc.warband.toString()
		};
		document.body.appendChild(pageSnippets.produceFromSnippet("warbandcode", warbandcode, variables));
	};
	showBox(document.getElementById("warbandcode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
	let warbandcodeEditor = document.querySelector("div#warbandcode textarea");
	warbandcodeEditor.value = owc.warband.toString();
	warbandcodeEditor.select();
};

warbandcode.applyClick = function ()
{
	let codeIsValid = false;
	let lastGoodwarbandcode = owc.warband.toString();
	let newwarbandcode = document.querySelector("div#warbandcode textarea").value;
	console.log(newwarbandcode);
	if (newwarbandcode !== "")
	{
		try
		{
			owc.warband.fromString(newwarbandcode, owc.resources);
			codeIsValid = true;
		}
		catch (ex)
		{
			console.error("owc.warband.fromString():", ex, newwarbandcode);
		}
	}
	if (codeIsValid === true)
	{
		owc.undoer.clear();
	}
	else
	{
		owc.warband.fromString(lastGoodwarbandcode, owc.resources);
		window.alert("The warband code you have entered is invalid.");
	}
	printWarband();
	sweepVolatiles();
};

warbandcode.closeClick = function ()
{
	sweepVolatiles();
};
