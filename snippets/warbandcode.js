/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let warbandcode = {
	show: () =>
	{
		warbandcode.element = document.getElementById("warbandcode");
		warbandcode.textarea = warbandcode.element.querySelector("textarea");
		warbandcode.element.querySelector("#includeComments").checked = owcSettings.options.warbandcodeIncludesComments;
		warbandcode.includeCommentsClick();
		owc.ui.showBluebox(warbandcode.element);
	},
	close: () => owc.ui.sweepVolatiles(),
	includeCommentsClick: (clickEvent) =>
	{
		let optionChekced = warbandcode.element.querySelector("#includeComments").checked;
		owcSettings.options.warbandcodeIncludesComments = optionChekced;
		warbandcode.textarea.value = owc.getWarbandCode(optionChekced);
	},
	applyClick: (clickEvent) =>
	{
		let lastGoodWarbandCode = owc.warband.toString();
		let newWarbandCode = warbandcode.textarea.value;
		owcEditor.setUndoPoint("Apply warband code.");
		if (owc.importWarband(newWarbandCode))
		{
			warbandcode.close();
			owc.ui.notify("Warband code successfully applied.");
		}
		else
		{
			owcEditor.undoer.undo();
			owc.warband.fromString(lastGoodWarbandCode, owcResources.data);
			owc.ui.showNotification(warbandcode.element.querySelector("#invalidBubble"));
		}
	},
	copyToClipboardClick: (clickEvent) =>
	{
		warbandcode.textarea.select();
		document.execCommand("copy");
		owc.ui.showNotification(warbandcode.element.querySelector("#copiedBubble"));
		warbandcode.textarea.blur();
	}
};
