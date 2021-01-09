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
	owc.ui.showElement(document.getElementById("warbandcode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 10)) + "px", null, true);
};

warbandcode.applyClick = function (clickEvent)
{
	let codeIsValid = false;
	let lastGoodWarbandCode = owc.warband.toString();
	let newWarbandCode = document.querySelector("#warbandcode textarea").value.replace(/[\s]/g, "");
	try
	{
		owc.warband.fromString(newWarbandCode, owc.resources.data);
		codeIsValid = true;
	}
	catch (ex)
	{
		console.error(ex.message);
	};
	if (codeIsValid === true)
	{
		owc.importWarband(newWarbandCode);
	}
	else
	{
		owc.warband.fromString(lastGoodWarbandCode, owc.resources.data);
		window.alert("The warband code you have entered is invalid.");
	};
};

warbandcode.closeClick = function (clickEvent)
{
	owc.ui.sweepVolatiles();
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
