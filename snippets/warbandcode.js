"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var warbandcode = {};

warbandcode.element = null;

warbandcode.show = function ()
{
	warbandcode.element = document.getElementById("warbandcode");
	if (warbandcode.element !== null)
	{
		for (let node of warbandcode.element.querySelectorAll(".notification"))
		{
			node.addEventListener("animationend", () => node.classList.remove("visible"));
		};
	warbandcode.element.querySelector("#includeComments").checked = owc.settings.options.warbandcodeIncludesComments;
	warbandcode.includeCommentsClick();
};
	owc.ui.showBluebox(warbandcode.element);
};

warbandcode.includeCommentsClick = function(clickEvent)
{
	let optionChekced = warbandcode.element.querySelector("#includeComments").checked;
	owc.settings.options.warbandcodeIncludesComments = optionChekced;
	warbandcode.element.querySelector("textarea").value = owc.getWarbandCode(optionChekced);
};

warbandcode.applyClick = function (clickEvent)
{
	let lastGoodWarbandCode = owc.warband.toString();
	let newWarbandCode = document.querySelector("#warbandcode textarea").value;
	owc.editor.setUndoPoint("Apply warband code");
	try
	{
		owc.importWarband(newWarbandCode);
		owc.ui.sweepVolatiles();
		owc.ui.printWarband();
	}
	catch (ex)
	{
		console.error(ex.message);
		owc.editor.undoer.undo();
		owc.warband.fromString(lastGoodWarbandCode, owc.resources.data);
		warbandcode.element.querySelector("#invalidBubble").classList.add("visible");
	};
};

warbandcode.copyToClipboardClick = function (clickEvent)
{
	document.querySelector("#warbandcode textarea").select();
	document.execCommand("copy");
	warbandcode.element.querySelector("#copiedBubble").classList.add("visible");
};
