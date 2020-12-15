"use strict";

const urlParam =
{
	"warband": "warband",
	"print": "print",
	"pid": "pid"
};

function editorEventListener(editorEvent) /* OK */
{
	console.log("editorEvent", editorEvent.detail);
	let unitIndex = Number(editorEvent.detail.unitindex);
	switch (editorEvent.detail.editor)
	{
	case "warbandname":
		owc.setWarbandName(editorEvent.detail.value);
		view.printWarbandName(owc.warband);
		refreshWindowTitle();
		break;
	case "name":
		owc.setUnitName(unitIndex, editorEvent.detail.value);
		printUnit(unitIndex);
		break;
	case "count":
		owc.setUnitCount(unitIndex, Number(editorEvent.detail.value));
		printUnit(unitIndex);
		break;
	case "quality":
		owc.setUnitQuality(unitIndex, editorEvent.detail.value);
		printUnit(unitIndex);
		break;
	case "combat":
		owc.setUnitCombatscore(unitIndex, editorEvent.detail.value);
		printUnit(unitIndex);
		break;
	case "specialruletext":
		owc.setSpecialruleText(unitIndex, editorEvent.detail.specialruleindex, editorEvent.detail.value);
		printUnit(unitIndex);
		break;
	}
	switch (editorEvent.detail.action)
	{
	case "addunit":
		owc.addUnit();
		printWarband();
		break;
	case "addspecialrule":
		owc.addSpecialrule(unitIndex, editorEvent.detail.value);
		printUnit(unitIndex);
		editorEvent.detail.originalEvent.target.value = "";
		break;
	case "removespecialrule":
		owc.removeSpecialrule(unitIndex, editorEvent.detail.value);
		printUnit(unitIndex);
		break;
	case "showunitmenu":
		view.unitMenu.popup(editorEvent.detail.originalEvent, unitIndex);
		break;
	case "duplicate":
		owc.duplicateUnit(unitIndex, editorEvent.detail.value);
		printWarband();
		break;
	case "copy":
		owc.copyUnitToClipboard(unitIndex);
		break;
	case "pasteunit":
		owc.addUnit(editorEvent.detail.unitcode);
		printWarband();
		break;
	case "remove":
		owc.removeUnit(unitIndex, editorEvent.detail.value);
		printWarband();
		break;
	case "moveup":
		owc.moveUnitUp(unitIndex, editorEvent.detail.value);
		printWarband();
		break;
	case "movedown":
		owc.moveUnitDown(unitIndex, editorEvent.detail.value);
		printWarband();
		break;
	};
};

function windowEventListener(windowEvent) /* OK */
{
	let eventHandlerName = "onWindow" + windowEvent.type.substr(0, 1).toUpperCase() + windowEvent.type.substr(1).toLowerCase();
	if (view[eventHandlerName] !== undefined)
	{
		view[eventHandlerName](windowEvent);
	};
};

function onWindowFocus(windowEvent)
{
	console.log("onWindowFocus");
	switch (windowEvent.type)
	{
	case "focus":
		checkCanPasteUnit();
		break;
	};
};

function initView()
{
	switch (owc.settings.viewMode)
	{
	case "list":
		view = new ListView(owc.settings, owc.resources, document.getElementById("warbandCanvas"));
		break;
	default:
		view = new ClassicView(owc.settings, owc.resources, document.getElementById("warbandCanvas"));
	};
};

function printUnit(unitIndex) /* OK */
{
	view.printUnit(owc.warband.units[unitIndex], unitIndex);
	view.printWarbandSummary(owc.warband);
	refreshUndoButton();
	refreshWindowTitle();
};

function printWarband() /* TODO */
{
	view.printWarband(owc.warband, interactiveMode);
	refreshWindowTitle();
	if (interactiveMode === true)
	{
		refreshUndoButton();
		checkCanPasteUnit();
	}
	else
	{
		dhtml.removeNodesByQuerySelectors([".noprint", ".tooltip"]);
	};
};

function checkCanPasteUnit()
{
	let unitClipboard = owc.getUnitFromClipboard();
	if (unitClipboard !== null)
	{
		if (view["notifyCanPaste"] !== undefined)
		{
			view.notifyCanPaste(unitClipboard.name, unitClipboard.code);
		};
	};
};

function refreshWindowTitle()
{
	document.title = owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + " (" + owc.warband.points + " " + owc.resources.translate("points", owc.settings.language) + ") - Song of Blades and Heroes Online Warband Creator";
	storeWarband();
};

function storeWarband()
{
	let pid = location.getParam(urlParam.pid);
	if (pid !== "")
	{
		let warbandCode = owc.warband.toString();
		/* do not store an empty warband (#17) */
		if (/(@[A-Z])[^@]+/.test(warbandCode) === true)
		{
			storage.store(pid, owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", warbandCode);
		};
	};
};

function refreshUndoButton() /* OK */
{
	let undoButton = document.getElementById("undoButton");
	if (owc.undoer.canUndo === true)
	{
		undoButton.classList.remove("disabled");
		undoButton.getElementsByClassName("tooltip")[0].innerHTML = "Undo: " + owc.undoer.lastChangeDescription + ".";
	}
	else
	{
		undoButton.classList.add("disabled");
		undoButton.getElementsByClassName("tooltip")[0].innerHTML = "Nothing to undo.";
	};
};

function undo() /* OK */
{
	if (owc.undoer.canUndo === true)
	{
		owc.warband.fromString(owc.undoer.undo(), owc.resources);
		printWarband();
	}
};

function newWarband() /* OK */
{
	let params = {};
	params[urlParam.pid] = generateNewPid();
	window.open(window.location.setParams(params, false, false));
};

function printPreview() /* todo */
{
	let params = {};
	params[urlParam.print] = "1";
	window.open(window.location.setParams(params, true, false));
};

function warbandToFile() /* OK */
{
	FileIo.offerFileToClient(owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + ".sbh.txt", owc.warband.toString());
};

function warbandFromFile(loadEvent) /* OK */
{
	let warbandCode = loadEvent.target.result;
	try
	{
		owc.warband.fromString(warbandCode, owc.resources);
		owc.undoer.clear();
		printWarband();
	}
	catch (ex)
	{
		console.error(ex);
		window.alert("Your file does not provide a valid warband code.");
	};
};
