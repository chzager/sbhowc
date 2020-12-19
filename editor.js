"use strict";

var editor = {};

editor.UNIT_CLIPBOARD_KEY = "owcUnitClipboard";
editor.undoer = new Undoer();

editor.eventListener = function (editorEvent)
{
	// console.log("editorEvent", editorEvent.detail);
	let unitIndex = Number(editorEvent.detail.unitindex);
	switch (editorEvent.detail.editor)
	{
	case "warbandname":
		editor.setWarbandName(editorEvent.detail.value);
		ui.visualizer.printWarbandName(owc.warband);
		ui.refreshWindowTitle();
		break;
	case "name":
		editor.setUnitName(unitIndex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		break;
	case "count":
		editor.setUnitCount(unitIndex, Number(editorEvent.detail.value));
		ui.printUnit(unitIndex);
		break;
	case "quality":
		editor.setUnitQuality(unitIndex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		break;
	case "combat":
		editor.setUnitCombatscore(unitIndex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		break;
	case "specialruletext":
		editor.setSpecialruleText(unitIndex, editorEvent.detail.specialruleindex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		break;
	}
	switch (editorEvent.detail.action)
	{
	case "addunit":
		editor.addUnit();
		ui.printWarband();
		break;
	case "addspecialrule":
		editor.addSpecialrule(unitIndex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		editorEvent.detail.originalEvent.target.value = "";
		break;
	case "removespecialrule":
		editor.removeSpecialrule(unitIndex, editorEvent.detail.value);
		ui.printUnit(unitIndex);
		break;
	case "showunitmenu":
		ui.visualizer.unitMenu.popup(editorEvent.detail.originalEvent, unitIndex);
		break;
	case "duplicate":
		editor.duplicateUnit(unitIndex, editorEvent.detail.value);
		ui.printWarband();
		break;
	case "copy":
		editor.copyUnitToClipboard(unitIndex);
		break;
	case "pasteunit":
		editor.addUnit(editorEvent.detail.unitcode);
		ui.printWarband();
		break;
	case "remove":
		editor.removeUnit(unitIndex, editorEvent.detail.value);
		ui.printWarband();
		break;
	case "moveup":
		editor.moveUnitUp(unitIndex, editorEvent.detail.value);
		ui.printWarband();
		break;
	case "movedown":
		editor.moveUnitDown(unitIndex, editorEvent.detail.value);
		ui.printWarband();
		break;
	};
};

editor.refreshPasteUnitButton = function ()
{
	let clipboardData = storager.retrieve(editor.UNIT_CLIPBOARD_KEY);
	if (clipboardData !== null)
	{
		/* discard clipboard data if it's older than 30 minutes (#18) */
		let diffMinutes = Math.abs(clipboardData.date - Date.now()) / (1000 * 60);
		if (diffMinutes > 30)
		{
			localStorage.removeItem(editor.UNIT_CLIPBOARD_KEY);
			clipboardData.data = null;
		};
		if (ui.visualizer["notifyCanPaste"] !== undefined)
		{
			ui.visualizer.notifyCanPaste(clipboardData.title, clipboardData.data);
		};
	};
};

editor.setUndoPoint = function (undoText)
{
	editor.undoer.saveSnapshot(owc.warband.toString(), undoText);
};

editor.undo = function ()
{
	editor.undoer.undo();
};

editor.newWarband = function ()
{
	owc.warband.clear();
	editor.addUnit();
	editor.undoer.clear();
};

editor.setWarbandName = function (newName)
{
	newName = newName.trim();
	if (owc.warband.name !== newName)
	{
		editor.setUndoPoint("Rename warband");
		owc.warband.name = newName;
	};
};

editor.addUnit = function (unitCode = "")
{
	let newUnit = new Unit();
	if (unitCode !== "")
	{
		newUnit.fromString(unitCode, Warband.CURRENT_VERSION, owc.resources);
	};
	editor.setUndoPoint("Add unit");
	owc.warband.units.push(newUnit);
};

editor.duplicateUnit = function (unitIndex)
{
	editor.setUndoPoint("Duplicate " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
	let copiedUnit = new Unit();
	copiedUnit.fromString(owc.warband.units[unitIndex].toString(), Warband.CURRENT_VERSION, owc.resources);
	owc.warband.units.splice(unitIndex, 0, copiedUnit);
};

editor.copyUnitToClipboard = function (unitIndex)
{
	storager.store(editor.UNIT_CLIPBOARD_KEY, owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")), owc.warband.units[unitIndex].toString());
	editor.refreshPasteUnitButton();
};

editor.removeUnit = function (unitIndex)
{
	editor.setUndoPoint("Delete " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
	owc.warband.units.remove(unitIndex);
};

editor.moveUnitUp = function (unitIndex)
{
	if (unitIndex > 0)
	{
		owc.warband.units.swap(unitIndex, unitIndex - 1);
	};
};

editor.moveUnitDown = function (unitIndex)
{
	if (unitIndex < owc.warband.units.length - 1)
	{
		owc.warband.units.swap(unitIndex + 1, unitIndex);
	};
};

editor.setUnitName = function (unitIndex, newName)
{
	newName = newName.trim();
	if (owc.warband.units[unitIndex].name !== newName)
	{
		editor.setUndoPoint("Rename unit");
		owc.warband.units[unitIndex].name = newName;
	};
};

editor.setUnitCount = function (unitIndex, newCount)
{
	if ((isFinite(newCount) === false) || (newCount < 1))
	{
		newCount = 1;
	};
	if (newCount > 25)
	{
		newCount = 25;
	};
	if (owc.warband.units[unitIndex].count !== newCount)
	{
		editor.setUndoPoint("Set count of " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
		owc.warband.units[unitIndex].count = newCount;
	};
};

editor.setUnitQuality = function (unitIndex, newQuality)
{
	if (owc.warband.units[unitIndex].quality !== newQuality)
	{
		editor.setUndoPoint("Set quality value of " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
		owc.warband.units[unitIndex].quality = newQuality;
	};
};

editor.setUnitCombatscore = function (unitIndex, newCombatscore)
{
	if (owc.warband.units[unitIndex].combat !== newCombatscore)
	{
		editor.setUndoPoint("Set combat value of " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
		owc.warband.units[unitIndex].combat = newCombatscore;
	};
};

editor.addSpecialrule = function (unitIndex, specialruleKey)
{
	let nativeText = owc.resources.defaultText(specialruleKey);
	editor.setUndoPoint("Add \"" + nativeText + "\" special rule to " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
	if (owc.warband.units[unitIndex].addSpecialrule(specialruleKey, owc.resources) === true)
	{
		let specialrule = owc.resources.data[specialruleKey];
		if (specialrule.replaces !== undefined)
		{
			for (let r = 0; r < specialrule.replaces.length; r += 1)
			{
				for (let s = 0; s < owc.warband.units[unitIndex].specialrules.length; s += 1)
				{
					if (owc.warband.units[unitIndex].specialrules[s].key === specialrule.replaces[r])
					{
						owc.warband.units[unitIndex].removeSpecialrule(specialrule.replaces[r]);
					};
				}
			};
		};
	}
	else
	{
		editor.undo();
	};
};

editor.removeSpecialrule = function (unitIndex, specialruleIndex)
{
	let nativeText = owc.resources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
	editor.setUndoPoint("Revoke \"" + nativeText + "\" special rule from " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
	owc.warband.units[unitIndex].removeSpecialrule(specialruleIndex);
};

editor.setSpecialruleText = function (unitIndex, specialruleIndex, newSpecialruleText)
{
	let nativeText = owc.resources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
	if (newSpecialruleText === "")
	{
		newSpecialruleText = "...";
	};
	if (owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText !== newSpecialruleText)
	{
		editor.setUndoPoint("Specify \"" + nativeText + "\" special rule for " + owc.warband.units[unitIndex].name.notEmpty(owc.resources.defaultText("defaultUnitName")));
		owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText = newSpecialruleText;
	};
};
