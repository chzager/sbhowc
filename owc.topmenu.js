"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.topMenu = {};

owc.topMenu.toggleButton = document.getElementById("top-menu-toggle-button");
owc.topMenu.popupMenu = document.getElementById("top-menu-popup");
owc.topMenu.sharePopup = document.getElementById("share-popup");

owc.topMenu.init = function ()
{
	window.addEventListener(owc.ui.sweepvolatilesEvent, owc.topMenu.closePopupMenu);
	window.addEventListener(owc.ui.sweepvolatilesEvent, owc.topMenu.closeShareMenu);
	console.debug("navigator.share:", navigator.share);
	if (typeof navigator.share !== "function")
	{
		document.getElementById("share-more").remove();
	}
	else
	{
		document.getElementById("share-link").remove();
	};
};

owc.topMenu.preparePopup = function ()
{
	owc.ui.sweepVolatiles();
	owc.ui.blurPage("editor-only");
};

owc.topMenu.openPopupMenu = function ()
{
	owc.topMenu.preparePopup();
	owc.topMenu.toggleButton.classList.remove("fa-angle-double-down");
	owc.topMenu.toggleButton.classList.add("fa-angle-double-up");
	htmlBuilder.adjust(owc.topMenu.popupMenu, owc.topMenu.toggleButton, "below bottom, start left");
	owc.topMenu.popupMenu.style.height = String(owc.topMenu.popupMenu.firstElementChild.clientHeight) + "px";
};

owc.topMenu.closePopupMenu = function ()
{
	owc.topMenu.toggleButton.classList.remove("fa-angle-double-up");
	owc.topMenu.toggleButton.classList.add("fa-angle-double-down");
	owc.topMenu.popupMenu.style.height = "0px";
};

owc.topMenu.warbandMenuClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	(owc.topMenu.popupMenu.style.height === "0px") ? owc.topMenu.openPopupMenu() : owc.topMenu.closePopupMenu();
};

owc.topMenu.openShareMenu = function ()
{
	owc.topMenu.preparePopup();
	htmlBuilder.adjust(owc.topMenu.sharePopup, document.getElementById("share-menu-button"), "below bottom, end right");
	owc.topMenu.sharePopup.style.height = String(owc.topMenu.sharePopup.firstElementChild.clientHeight) + "px";
};

owc.topMenu.closeShareMenu = function ()
{
	owc.topMenu.sharePopup.style.height = "0px";
};

owc.topMenu.shareClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	(owc.topMenu.sharePopup.style.height === "0px") ? owc.topMenu.openShareMenu() : owc.topMenu.closeShareMenu();
};

owc.topMenu.newWarbandClick = function (clickEvent)
{
	window.open(window.location.setParams(
		{
			[owc.urlParam.pid]: owc.newPid()
		}, ["console"]));
};

owc.topMenu.showWarbandCodeClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	warbandcode.show();
};

owc.topMenu.restoreWarbandClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	restorer.show();
};

owc.topMenu.printPreviewClick = function (clickEvent)
{
	window.open(window.location.setParams(
		{
			[owc.urlParam.print]: "1"
		}, ["pid", "console"]));
};

owc.topMenu.showSettingsClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	settingsUi.show();
};

owc.topMenu.warbandFromFileClick = function (clickEvent)
{
	fileIo.requestClientFile(clickEvent).then((fileEvent) =>
	{
		try
		{
			owc.importWarband(fileEvent.target.result);
			owc.ui.printWarband();
		}
		catch (ex)
		{
			console.error(ex);
			owc.ui.notify("Your file does not provide a valid warband code.", "red");
		};
	}
	);
};

owc.topMenu.warbandToFileClick = function (clickEvent)
{
	fileIo.offerFileToClient(owc.helper.nonBlankWarbandName() + ".owc.txt", owc.getWarbandCode(true));
};
