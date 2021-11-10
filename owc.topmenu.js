"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.topMenu =
{
	STORAGE_MENU_ID: "storage",
	warbandMenuButton: document.getElementById("top-menu-toggle-button"),
	shareMenuButton: document.getElementById("share-menu-button")
};

owc.topMenu.init = function ()
{
	window.addEventListener(owc.ui.SWEEP_VOLATILES_EVENT, owc.topMenu.resetWarbandMenuButton);
	owc.topMenu.warbandMenu = new Menubox("warbandMenu",
	{
		css: "topdown horizontal",
		adjust:
		{
			height: ["0px", "auto"]
		},
		items: [
			{
				key: "loadFromFile",
				label: "Load from file",
			},
			{
				key: "saveToFile",
				label: "Save to file",
			},
			{
				key: "restoreWarband",
				label: "Restore warband"
			},
			{
				key: "showWarbandCode",
				label: "Show warband code"
			}
		]
	}, owc.topMenu.onWarbandmenuEvent
		);
	owc.topMenu.shareMenu = new Menubox("shareMenu",
	{
		css: "topdown vertical",
		adjust:
		{
			height: ["0px", "auto"]
		},
		items: [
			{
				key: "whatsapp",
				label: "WhatsApp",
				iconFontAwesome: "fab fa-whatsapp"
			},
			/* {
				key: "facebook",
				label: "Facebook",
				iconFontAwesome: "fab fa-facebook-f"
			}, */
			{
				key: "twitter",
				label: "Twitter",
				iconFontAwesome: "fab fa-twitter"
			},
			{
				key: "email",
				label: "E-Mail",
				iconFontAwesome: "fas fa-envelope"
			}
		]
	}, owc.topMenu.onSharemenuEvent
		);

	console.debug("navigator.share:", navigator.share);
	if (typeof navigator.share === "function")
	{
		owc.topMenu.shareMenu.appendItem(
		{
			key: "browser",
			label: "More...",
			iconFontAwesome: "fas fa-ellipsis-h"
		}
		);
	}
	else
	{
		owc.topMenu.shareMenu.appendItem(
		{
			key: "link",
			label: "Create Link",
			iconFontAwesome: "fas fa-link"
		}
		);
	};
};

owc.topMenu.preparePopup = function ()
{
	owc.ui.sweepVolatiles();
	owc.ui.blurPage("editor-only");
};

owc.topMenu.resetWarbandMenuButton = function ()
{
	owc.topMenu.warbandMenuButton.classList.remove("fa-angle-double-up");
	owc.topMenu.warbandMenuButton.classList.add("fa-angle-double-down");
};

owc.topMenu.onWarbandMenuButtonClick = function (clickEvent) /* OK */
{
	clickEvent.stopPropagation();
	owc.topMenu.preparePopup();
	owc.topMenu.warbandMenuButton.classList.remove("fa-angle-double-down");
	owc.topMenu.warbandMenuButton.classList.add("fa-angle-double-up");
	owc.topMenu.warbandMenu.popup(null, null, owc.topMenu.warbandMenuButton, "below bottom, start left");
};

owc.topMenu.onShareMenuButtonClick = function (clickEvent) /* OK */
{
	clickEvent.stopPropagation();
	owc.topMenu.preparePopup();
	owc.topMenu.shareMenu.popup(null, null, owc.topMenu.shareMenuButton, "below bottom, end right");
};

/* event handlers */

owc.topMenu.newWarbandClick = function (clickEvent)
{
	window.open(window.location.setParams({[owc.urlParam.PID]: owc.generatrePid()}, ["console"]));
};

owc.topMenu.printPreviewClick = function (clickEvent)
{
	window.open(window.location.setParams({[owc.urlParam.PRINT]: "1"}, ["pid", "print"]));
};

owc.topMenu.showSettingsClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	settingsUi.show();
};

owc.topMenu.promptStorageService = function(context)
{
	function _onStoragemenuEvent(data)
	{
		owc.settings.storage = data.itemKey;
		owc.settings.save();
		/* write ehether load or save back to data */
		data.itemKey = data.context;
		owc.topMenu.onWarbandmenuEvent(data);
	};
	owc.ui.blurPage("dim");
	let storagePromptMenu = new Menubox(owc.topMenu.STORAGE_MENU_ID,{
		position: "fixed",
		title: "Where do you want to store your warband files?",
		items: [
			{key: "localDevice", label: "Locally on my device", iconFontAwesome: "fas fa-hdd"},
			{html: htmlBuilder.newElement("div.separator-wrapper", htmlBuilder.newElement("span.separator", "or in a cloud storage"))},
			{key: "oneDrive", label: "Microsoft OneDrive", iconFontAwesome: "fas fa-cloud"},
			{key: "googleDrive", label: "Google Drive", iconFontAwesome: "fab fa-google-drive"},
			{html: htmlBuilder.newElement("div.annotations", "You may note the ", htmlBuilder.newElement("a", {href:"tos_pp.html#pp", 'class':"light", target:"_blank"}, "Privacy Policy"), " when using a cloud storage service.", {onclick:"event.stopPropagation();"})}
		]
	}, _onStoragemenuEvent);
	storagePromptMenu.element.appendChild(htmlBuilder.newElement("div.annotations.more", "You can change this at any time in the settings.", {onclick:"event.stopPropagation()"}));
	let menuRect = storagePromptMenu.element.getBoundingClientRect();
	storagePromptMenu.element.style.top = Math.round((window.innerHeight - menuRect.height) / 2) + "px";
	storagePromptMenu.element.style.left = Math.round((window.innerWidth - menuRect.width) / 2) + "px";
	if (menuRect.height > window.innerHeight)
	{
		let itemsList = storagePromptMenu.element.querySelector(".items");
		itemsList.style.height = (itemsList.offsetHeight - (menuRect.height - window.innerHeight)) + "px";
		itemsList.style.overflowY = "scroll";
		storagePromptMenu.element.style.top = "0px";
	};
	storagePromptMenu.popup(null, context);
};

owc.topMenu.onWarbandmenuEvent = function(data)
{
	owc.ui.sweepVolatiles();
	switch (data.itemKey)
	{
	case "loadFromFile":
		(owc.settings.storage) ? owc.fileIo[owc.settings.storage].load(data.originalEvent) : owc.topMenu.promptStorageService(data.itemKey);
		break;
	case "saveToFile":
		(owc.settings.storage) ? owc.fileIo[owc.settings.storage].save(data.originalEvent) : owc.topMenu.promptStorageService(data.itemKey);
		break;
	case "restoreWarband":
		restorer.show();
		break;
	case "showWarbandCode":
		warbandcode.show();
		break;
	};
};

owc.topMenu.onSharemenuEvent = function(data)
{
	owc.ui.sweepVolatiles();
	console.log("SHARE", data.itemKey);
	owc.share(data.itemKey);
};
