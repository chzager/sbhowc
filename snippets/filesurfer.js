const fileSurfer = {
	STORAGE_KEY: "filesurfer",
	sort: {
		field: "name",
		direction: 1
	},
	init: () => {
		fileSurfer.element = document.body.querySelector("#filesurfer");
		let storedService = localStorage.getItem(fileSurfer.STORAGE_KEY);
		if (!!storedService)
		{
			fileSurfer.registerService(storedService);
		}
	},
	registerService: (key) => {
		fileSurfer.unregisterService();
		localStorage.setItem(fileSurfer.STORAGE_KEY, key);
		fileSurfer.cloudService = owc.cloud[key];
		fileSurfer.currentFolderStorageKey = fileSurfer.STORAGE_KEY + "_" + key + "_currentFolder";
		fileSurfer.currentFolderId = localStorage.getItem(fileSurfer.currentFolderStorageKey) || fileSurfer.cloudService.ROOT_FOLDER_ID;
	},
	unregisterService: () => {
		localStorage.removeItem(fileSurfer.STORAGE_KEY);
		fileSurfer.currentFolderId = null;
		fileSurfer.currentFolderStorageKey = null;
		fileSurfer.currentContent = [];
		fileSurfer.cloudService = null;
	},
	show: () => {
		fileSurfer.itemWrapperHeight = null;
		owc.ui.showBluebox(document.getElementById("filesurfer"));
		if (!fileSurfer.cloudService)
		{
			fileSurfer.renderNotsignedin();
		}
		else
		{
			fileSurfer.renderContent();
			fileSurfer.cloudService.getSigninStatus().then((isSignedIn) => { (isSignedIn) ? fileSurfer.listFolderContent(fileSurfer.currentFolderId) : fileSurfer.renderNotsignedin(); });
		}
	},
	close: () => owc.ui.sweepVolatiles(),
	onSigninClick: (clickEvent) => {
		owc.cloud[clickEvent.target.closest("button").getAttribute("data-cloud_service")].signIn();
	},
	onSignoutClick: (clickEvent) => {
		fileSurfer.cloudService.signOut();
		fileSurfer.unregisterService();
		owc.ui.animateElement(document.body.querySelector("#filesurfer div.blue-viewport div.content"), "animation", () => { fileSurfer.renderNotsignedin(true); });
	},
	renderNotsignedin: (animated = false) => {
		let element = pageSnippets.filesurfer.not_signed_in.produce(fileSurfer);
		if (animated === true)
		{
			element.querySelector("div.not_signed_in").classList.add("animation");
		}
		htmlBuilder.replaceContent(fileSurfer.element, element);
	},
	renderContent: () => {
		let data = {
			title: fileSurfer.cloudService.TITLE,
			icon: fileSurfer.cloudService.FA_ICON
		};
		htmlBuilder.replaceContent(fileSurfer.element, pageSnippets.filesurfer.content.produce(fileSurfer, data));
		/* adjust height of table-wrapper so we do not need to scroll */
		let blueboxRect = document.getElementById("filesurfer").getBoundingClientRect();
		let tableWrapperRect = document.getElementById("filesurfer-table-wrapper").getBoundingClientRect();
		let buttonsRect = document.getElementById("filesurfer-buttons").getBoundingClientRect();
		document.getElementById("filesurfer-table-wrapper").style.maxHeight = Math.floor(blueboxRect.height - buttonsRect.height - tableWrapperRect.top - 24) + "px";
	},
	listFolderContent: (folderRef) => {
		htmlBuilder.replaceElement(fileSurfer._getTableBodyElement(), pageSnippets.filesurfer.dummies.itemlist.produce());
		fileSurfer.cloudService.getFolderContent(folderRef).then((folderContent) =>
		{
			fileSurfer.currentFolderId = folderRef;
			fileSurfer.currentContent = folderContent;
			localStorage.setItem(fileSurfer.currentFolderStorageKey, fileSurfer.currentFolderId);
			let doesContainFiles = false;
			for (let file of fileSurfer.currentContent)
			{
				file.lastModifiedText = _naturalPast(new Date(file.lastModified));
				doesContainFiles ||= (file.type === "file");
			}
			fileSurfer._listCurrentContent();
		});
		fileSurfer.cloudService.getBreadcrumps(folderRef).then((breadcrumps) => {
			let data = {
				icon: fileSurfer.cloudService.FA_ICON,
				breadcrumps: breadcrumps
			};
			let newBreadcrumpsElement = htmlBuilder.replaceElement(document.body.querySelector("#filesurfer p.breadcrumps"),  pageSnippets.filesurfer.content.breadcrumps.produce(fileSurfer, data));
			newBreadcrumpsElement.scrollTo({
				left: newBreadcrumpsElement.scrollWidth,
				behavior: "smooth"
			});
		});
	},
	onTableheaderClick: (clickEvent) => {
		const element = clickEvent.target.closest("[data-sortfield]");
		const sortField = element.getAttribute("data-sortfield");
		if (fileSurfer.sort.field === sortField)
		{
			fileSurfer.sort.direction = fileSurfer.sort.direction * -1;
		}
		fileSurfer.sort.field = sortField;
		fileSurfer._listCurrentContent();
	},
	onBreadcrumpClick: (clickEvent) => fileSurfer.onItemDblClick(clickEvent),
	onItemClick: (clickEvent) => {
		const item = clickEvent.target.closest("[data-id]");
		for (let selectedItem of fileSurfer.element.querySelectorAll("table .selected"))
		{
			selectedItem.classList.remove("selected");
		};
		if (item.getAttribute("data-type") === "file")
		{
			item.classList.add("selected");
		}
	},
	onItemDblClick: (clickEvent) => {
		const item = clickEvent.target.closest("[data-id]");
		const itemRef = item.getAttribute("data-id");
		/* unselect everything in document, some browsers interpret a dblclk as intend to select anything */
		if (typeof window.getSelection === "function")
		{
			window.getSelection().removeAllRanges();
		}
		switch (item.getAttribute("data-type"))
		{
			case "folder":
				fileSurfer.listFolderContent(itemRef);
				break;
			case "file":
				fileSurfer.onLoadClick(clickEvent);
				break;
		}
	},
	onLoadClick: (clickEvent) => {
		let selectedTrElement = document.body.querySelector("#filesurfer table .selected");
		if (selectedTrElement)
		{
			fileSurfer.cloudService.loadFile(selectedTrElement.getAttribute("data-id"));
			fileSurfer.close();
		}
	},
	onSaveClick: (clickEvent) => {
		fileSurfer.cloudService.saveFile(fileSurfer.currentFolderId);
		fileSurfer.close();
	},
	_getTableBodyElement: () => document.body.querySelector("#filesurfer table tbody"),
	_listCurrentContent: () => {
		fileSurfer.currentContent.sort((a, b) =>
		{
			const PREFIX = {folder: "(a)", file:"(b)"};
			let compare = 0;
			switch (fileSurfer.sort.field)
			{
				case "name":
					compare = (PREFIX[a.type] + a.name).localeCompare(PREFIX[b.type] + b.name);
					break;
				case "lastModified":
					compare = (a.type !== "folder") ? Math.sign(b.lastModified - a.lastModified) : (PREFIX[a.type] + a.name).localeCompare(PREFIX[b.type] + b.name);
					break;
			}
			return compare * fileSurfer.sort.direction;
		});
		let data = {
			files: fileSurfer.currentContent,
		};
		htmlBuilder.replaceElement(fileSurfer._getTableBodyElement(), pageSnippets.filesurfer.content.itemlist.produce(fileSurfer, data));
	}
};

function _naturalPast(pastDate)
{
	const wordings = ["just now", "{{n}} minutes ago", "{{6}} hours ago"];
	const dayWordings = ["today", "yesterday", "two days ago"];
	let result = "";
	let now = new Date();
	let maxHours = Number(/\{{2}(\d+)\}{2}/.exec(wordings[2])[1]);
	let secondsDiff = (now.getTime() - pastDate.getTime()) / 1000;
	let diff = {
		minutes: secondsDiff / 60,
		hours: secondsDiff / 60 / 60,
		days: Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate())) / (1000 * 60 * 60 * 24))
	};
	if (secondsDiff < 60)
	{
		result = wordings[0];
	}
	else if (diff.minutes < 60)
	{
		result = wordings[1].replace(/\{{2}.\}{2}/, Math.floor(diff.minutes));
	}
	else if (diff.hours < maxHours)
	{
		result = wordings[2].replace(/\{{2}.\}{2}/, Math.floor(diff.hours));
	}
	else if (diff.days < dayWordings.length)
	{
		result = dayWordings[diff.days] + " " + pastDate.toIsoFormatText("HN");
	}
	else
	{
		result = pastDate.toIsoFormatText();
	}
	return result;
};
