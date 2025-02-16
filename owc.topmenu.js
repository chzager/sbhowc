/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/chzager/sbhowc)
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
					key: "cloudStorage",
					label: "Access a cloud storage"
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
					iconHtml: htmlBuilder.newElement("i.fab.fa-whatsapp")
				},
				/* {
					key: "facebook",
					label: "Facebook",
					iconFontAwesome: "fab fa-facebook-f"
				}, */
				{
					key: "twitter",
					label: "Twitter",
					iconHtml: htmlBuilder.newElement("i.fab.fa-twitter")
				},
				{
					key: "email",
					label: "E-Mail",
					iconHtml: htmlBuilder.newElement("i.fas.fa-envelope")
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
				iconHtml: htmlBuilder.newElement("i.fas.fa-ellipsis-h")
			}
		);
	}
	else
	{
		owc.topMenu.shareMenu.appendItem(
			{
				key: "link",
				label: "Create Link",
				iconHtml: htmlBuilder.newElement("i.fas.fa-link")
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
	window.open(window.location.setParams({ [owc.urlParam.PID]: owc.generatrePid() }, ["console"]));
};

owc.topMenu.printPreviewClick = function (clickEvent)
{
	window.open(window.location.setParams({ [owc.urlParam.PRINT]: "1" }, ["pid", "print"]));
};

owc.topMenu.showSettingsClick = function (clickEvent)
{
	clickEvent.stopPropagation();
	settingsUi.show();
};

;

owc.topMenu.onWarbandmenuEvent = function (data)
{
	owc.ui.sweepVolatiles();
	switch (data.itemKey)
	{
		case "loadFromFile":
			owc.fileIo.localDevice.load(data.originalEvent);
			break;
		case "saveToFile":
			owc.fileIo.localDevice.save(data.originalEvent);
			break;
		case "cloudStorage":
			fileSurfer.show();
			break;
		case "restoreWarband":
			restorer.show();
			break;
		case "showWarbandCode":
			warbandcode.show();
			break;
	};
};

owc.topMenu.onSharemenuEvent = function (data)
{
	owc.ui.sweepVolatiles();
	console.log("SHARE", data.itemKey);
	owc.share(data.itemKey);
};
