"use strict";

const urlParam = {
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
		storage.store(pid, owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName")) + "[[" + owc.warband.figureCount + ";" + owc.warband.points + "]]", owc.warband.toString());
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

function sweepVolatiles() /* OK */
{
	let volatileElements = document.body.querySelectorAll(".volatile");
	for (let i = 0; i < volatileElements.length; i += 1)
	{
		if (volatileElements[i])
		{
			volatileElements[i].style.visibility = "hidden";
		}
	}
	document.getElementById("page").classList.remove("blurred");
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
	window.open(window.location.setParams({"pid": generateNewPid()}, false, false));
};

function printPreview() /* todo */
{
	let params = {};
	params[urlKeyWarband] = owc.warband.toString();
	params[urlKeyPrint] = "1";
	window.open(window.location.setParams(params));
};

function warbandToFile() /* OK */
{
	ClientFile.write(owc.warband.name.notEmpty(owc.resources.defaultText("defaultWarbandName") + ".sbh.txt"), owc.warband.toString());
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

function showWarbandCode() /* OK */
{
	document.getElementById("warbandCodeTextarea").value = owc.warband.toString();
	showBox(document.getElementById("warbandCode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
	document.getElementById("warbandCodeTextarea").select();
};

function applyWarbandCode(warbandCode) /* OK */
{
	let codeIsValid = false;
	let lastGoodWarbandCode = owc.warband.toString();
	if (warbandCode !== undefined) /* TODO: why? */
	{
		try
		{
			owc.warband.fromString(warbandCode, owc.resources);
			codeIsValid = true;
		}
		catch (ex)
		{
			console.error("owc.warband.fromString():", ex, warbandCode);
		}
	}
	if (codeIsValid === true)
	{
		owc.undoer.clear();
	}
	else
	{
		owc.warband.fromString(lastGoodWarbandCode, owc.resources);
		window.alert("The warband code you have entered is invalid.");
	}
	printWarband();
	sweepVolatiles();
};

function showSettings() /* OK */
{
	function settingsToGui(settingsPanel)
	{
		// set checks for rules scope
		let rulesScopeChecks = settingsPanel.querySelectorAll("input[data-settingsgroup='rules_scope']");
		for (let i = 0; i < rulesScopeChecks.length; i += 1)
		{
			let val = rulesScopeChecks[i].getAttribute("data-settingskey");
			rulesScopeChecks[i].checked = owc.settings.ruleScope.includes(val);
		}
		// set language
		settingsPanel.querySelector("select[data-settingsgroup='language']").value = owc.settings.language;
		// set view mode
		settingsPanel.querySelector("input[data-settingsgroup='view_mode'][data-settingskey='" + owc.settings.viewMode + "']").checked = true;
		// set options
		for (let key in owc.settings.options)
		{
			settingsPanel.querySelector("input[data-settingsgroup='options'][data-settingskey='" + key + "']").checked = owc.settings.options[key];
		}
	};
	let settingsPanel = document.getElementById("settingsPanel");
	settingsToGui(settingsPanel);
	showBox(settingsPanel, String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
};

function applySettings() /* OK */
{
	function settingsFromGui()
	{
		// get checked rules scope
		let rulesScopeChecks = settingsPanel.querySelectorAll("input[data-settingsgroup='rules_scope']");
		owc.settings.ruleScope = [];
		for (let i = 0; i < rulesScopeChecks.length; i += 1)
		{
			if (rulesScopeChecks[i].checked === true)
			{
				let val = rulesScopeChecks[i].getAttribute("data-settingskey");
				owc.settings.ruleScope.push(val);
			}
		}
		// get language
		let languageDropDown = settingsPanel.querySelector("select[data-settingsgroup='language']");
		owc.settings.language = languageDropDown[languageDropDown.selectedIndex].value;
		// get view mode
		let availibleViewModes = settingsPanel.querySelectorAll("input[data-settingsgroup='view_mode']");
		for (let i = 0; i < availibleViewModes.length; i += 1)
		{
			if (availibleViewModes[i].checked === true)
			{
				owc.settings.viewMode = availibleViewModes[i].getAttribute("data-settingskey");
				break;
			}
		}
		// get options
		let optionItems = settingsPanel.querySelectorAll("input[data-settingsgroup='options']");
		for (let i = 0; i < optionItems.length; i += 1)
		{
			let optionsItem = optionItems[i];
			owc.settings.options[optionsItem.getAttribute("data-settingskey")] = optionsItem.checked;
		}
	};
	let settingsPanel = document.getElementById("settingsPanel");
	settingsFromGui(settingsPanel);
	owc.settings.save();
	initResources(owc.resources, owc.settings);
	// initView();
	// printWarband();
	sweepVolatiles();
}

function showBox(domElement, topPosition, leftPosition, blurPage = false)
{
	domElement.style.display = "block";
	domElement.style.visibility = "visible";
	if (leftPosition)
	{
		domElement.style.left = leftPosition;
	}
	if (topPosition)
	{
		domElement.style.top = topPosition;
	}
	document.body.appendChild(domElement);
	if (blurPage === true)
	{
		showBox(document.getElementById("blur"));
	}
};
