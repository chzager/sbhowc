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
	let warbandcodeEditor = document.querySelector("#warbandcode textarea");
	warbandcodeEditor.value = owc.warband.toString();
	ui.showElement(document.getElementById("warbandcode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
};

warbandcode.applyClick = function (clickEvent)
{
	let codeIsValid = false;
	let lastGoodwarbandcode = owc.warband.toString();
	let newWarbandCode = document.querySelector("#warbandcode textarea").value;
	if (newWarbandCode !== "")
	{
		newWarbandCode = newWarbandCode.replace(/[\s]/g, "");
		try
		{
			owc.warband.fromString(newWarbandCode, owc.resources.data);
			codeIsValid = true;
		}
		catch (ex)
		{
			console.error("owc.warband.fromString():", ex, newWarbandCode);
		}
	}
	if (codeIsValid === true)
	{
		editor.undoer.clear();
		ui.printWarband();
		ui.sweepVolatiles();
	}
	else
	{
		owc.warband.fromString(lastGoodwarbandcode, owc.resources.data);
		window.alert("The warband code you have entered is invalid.");
	}
};

warbandcode.closeClick = function (clickEvent)
{
	ui.sweepVolatiles();
};

warbandcode.copyToClipboardClick = function (clickEvent)
{
	let warbandcodeEditor = document.querySelector("#warbandcode textarea");
	warbandcodeEditor.select();
	document.execCommand("copy");
	document.querySelector("#warbandcode .copiedNotification").classList.add("copiedNotification-visible");
	/* remove animation style after animation ends */
	window.setTimeout(() =>
	{
		document.querySelector("#warbandcode .copiedNotification").classList.remove("copiedNotification-visible")
	}, 6000);
};
