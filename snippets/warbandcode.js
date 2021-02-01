"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var warbandcode = {};

warbandcode.show = function ()
{
	if (document.getElementById("warbandcode") === null)
	{
		let variables =
		{
			"warbandcode": owc.warband.toString()
		};
		document.body.appendChild(pageSnippets.produce("warbandcode", warbandcode, variables));
	};
	let warbandcodePanel = document.getElementById("warbandcode");
	let warbandcodeEditor = warbandcodePanel.querySelector("textarea");
	warbandcodeEditor.value = owc.warband.toString();
	owc.ui.showBluebox(warbandcodePanel);
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
