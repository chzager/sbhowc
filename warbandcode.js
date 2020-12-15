"use strict";

let Warbandcode = {};

Warbandcode.show = function ()
{
	if (document.getElementById("warbandcode") === null)
	{
		let variables =
		{
			"warbandcode": owc.warband.toString()
		};
		document.body.appendChild(PageSnippets.produceFromSnippet("warbandcode", Warbandcode, variables));
	};
	showBox(document.getElementById("warbandcode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
	let warbandcodeEditor = document.querySelector("div#warbandcode textarea");
	warbandcodeEditor.value = owc.warband.toString();
	warbandcodeEditor.select();
};

Warbandcode.applyClick = function ()
{
	let codeIsValid = false;
	let lastGoodWarbandCode = owc.warband.toString();
	let newWarbandCode = document.querySelector("div#warbandcode textarea").value;
	console.log(newWarbandCode);
	if (newWarbandCode !== "")
	{
		try
		{
			owc.warband.fromString(newWarbandCode, owc.resources);
			codeIsValid = true;
		}
		catch (ex)
		{
			console.error("owc.warband.fromString():", ex, newWarbandCode);
		}
	}
	if (codeIsValid === true)
	{
		owc.undoer.clear();
	}
	else
	{
		owc.warband.fromString(lastGoodWarbandCode, owc.resources);
		window.alert("The warband code you have entered is invalid.");
	}
	printWarband();
	sweepVolatiles();
};

Warbandcode.closeClick = function ()
{
	sweepVolatiles();
};
