"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.topMenu =
{
	warbandMenuButton: document.getElementById("top-menu-toggle-button"),
	shareMenuButton: document.getElementById("share-menu-button")
};

owc.topMenu.init = function ()
{
	window.addEventListener(owc.ui.sweepvolatilesEvent, owc.topMenu.resetWarbandMenuButton);
	window.addEventListener(Menubox.EVENT_ID, onMenuboxEvent);
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
				label: "Load from file" /*,
				submenu:
				{
					css: "topdown vertical",
					adjust:
					{
						height: ["0px", "auto"]
					},
					alignment: "start left, below bottom",
					items: [
						{
							key: "localDevice",
							label: "Local device",
							iconFontAwesome: "fas fa-upload"
						},
						{
							key: "oneDrive",
							label: "OneDrive",
							iconFontAwesome: "fas fa-cloud"
						},
						{
							key: "googleDrive",
							label: "Google Drive",
							iconFontAwesome: "fab fa-google-drive"
						}
					]
				} */
			},
			{
				key: "saveToFile",
				label: "Save to file" /*,
				submenu:
				{
					css: "topdown vertical",
					adjust:
					{
						height: ["0px", "auto"]
					},
					alignment: "start left, below bottom",
					items: [
						{
							key: "localDevice",
							label: "Local device",
							iconFontAwesome: "fas fa-download"
						},
						{
							key: "oneDrive",
							label: "OneDrive",
							iconFontAwesome: "fas fa-cloud"
						},
						{
							key: "googleDrive",
							label: "Google Drive",
							iconFontAwesome: "fab fa-google-drive"
						}
					]
				} */
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
	}
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
	}
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
	window.open(window.location.setParams(
		{
			[owc.urlParam.PID]: owc.newPid()
		}, ["console"]));
};

owc.topMenu.printPreviewClick = function (clickEvent)
{
	window.open(window.location.setParams(
		{
			[owc.urlParam.PRINT]: "1"
		}, ["pid", "print"]));
};

owc.topMenu.showSettingsClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	settingsUi.show();
};

function onMenuboxEvent(menuboxEvent)
{
	owc.ui.sweepVolatiles();
	let menuPath = menuboxEvent.detail.menubox.id.split("::");
	if (menuPath[0] === owc.topMenu.warbandMenu.id)
	{
		/* if (menuPath.includes("loadFromFile"))
		{
			owc.fileIo[menuboxEvent.detail.itemKey].load(menuboxEvent);
		}
		else if (menuPath.includes("saveToFile"))
		{
			owc.fileIo[menuboxEvent.detail.itemKey].save(menuboxEvent);
		}
		else */
		{
			switch (menuboxEvent.detail.itemKey)
			{
			case "loadFromFile":
				owc.fileIo.localDevice.load(menuboxEvent);
				break;
			case "saveToFile":
				owc.fileIo.localDevice.save(menuboxEvent);
				break;
			case "restoreWarband":
				restorer.show();
				break;
			case "showWarbandCode":
				warbandcode.show();
				break;
			};
		};
	}
	else if (menuPath[0] === owc.topMenu.shareMenu.id)
	{
		console.log("SHARE", menuboxEvent.detail.itemKey);
		owc.share(menuboxEvent.detail.itemKey);
	};
};
