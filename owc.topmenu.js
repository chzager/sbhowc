/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

let owcTopMenu = {
	warbandMenuButton: document.getElementById("top-menu-toggle-button"),
	shareMenuButton: document.getElementById("share-menu-button"),

	init: function ()
	{
		window.addEventListener(owc.ui.SWEEP_VOLATILES_EVENT, owcTopMenu.resetWarbandMenuButton);
		owcTopMenu.warbandMenu = new Menubox("warbandMenu",
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
			}, owcTopMenu.onWarbandmenuEvent
		);
		owcTopMenu.shareMenu = new Menubox("shareMenu",
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
			}, owcTopMenu.onSharemenuEvent
		);

		console.debug("navigator.share:", navigator.share);
		if (typeof navigator.share === "function")
		{
			owcTopMenu.shareMenu.appendItem(
				{
					key: "browser",
					label: "More...",
					iconHtml: htmlBuilder.newElement("i.fas.fa-ellipsis-h")
				}
			);
		}
		else
		{
			owcTopMenu.shareMenu.appendItem(
				{
					key: "link",
					label: "Create Link",
					iconHtml: htmlBuilder.newElement("i.fas.fa-link")
				}
			);
		};
	},

	preparePopup: function ()
	{
		owc.ui.sweepVolatiles();
		owc.ui.blurPage("editor-only");
	},

	resetWarbandMenuButton: function ()
	{
		owcTopMenu.warbandMenuButton.classList.remove("fa-angle-double-up");
		owcTopMenu.warbandMenuButton.classList.add("fa-angle-double-down");
	},

	onWarbandMenuButtonClick: function (clickEvent)
	{
		clickEvent.stopPropagation();
		owcTopMenu.preparePopup();
		owcTopMenu.warbandMenuButton.classList.remove("fa-angle-double-down");
		owcTopMenu.warbandMenuButton.classList.add("fa-angle-double-up");
		owcTopMenu.warbandMenu.popup(null, null, owcTopMenu.warbandMenuButton, "below bottom, start left");
	},

	onShareMenuButtonClick: function (clickEvent)
	{
		clickEvent.stopPropagation();
		owcTopMenu.preparePopup();
		owcTopMenu.shareMenu.popup(null, null, owcTopMenu.shareMenuButton, "below bottom, end right");
	},

	onMewWarbandClick: function (clickEvent)
	{
		window.open(window.location.setParams({ [owc.urlParam.PID]: owc.generatrePid() }, ["console"]));
	},

	onPrintPreviewClick: function (clickEvent)
	{
		window.open(window.location.setParams({ [owc.urlParam.PRINT]: "1" }, ["pid", "print"]));
	},

	onShowSettingsClick: function (clickEvent)
	{
		clickEvent.stopPropagation();
		settingsUi.show();
	},

	onWarbandmenuEvent: function (data)
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
	},

	onSharemenuEvent: function (data)
	{
		owc.ui.sweepVolatiles();
		console.log("SHARE", data.itemKey);
		owc.share(data.itemKey);
	}
};
