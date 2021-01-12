"use strict";

owc.editor = {};

owc.editor.UNIT_CLIPBOARD_KEY = "owcUnitClipboard";
owc.editor.undoer = null;
owc.editor.specialrulesList = [];

owc.editor.init = function ()
{
	owc.editor.undoer = new Undoer();
	window.addEventListener("editor", owc.editor.eventListener);
};

owc.editor.eventListener = function (editorEvent)
{
	let action = (editorEvent.detail.action !== undefined) ? editorEvent.detail.action : "set-" + editorEvent.detail.editor;
	console.debug("owc.editor.eventListener()", action, editorEvent.detail);
	let undoPoints = owc.editor.undoer.snapshots.length;
	let unitIndex = Number(editorEvent.detail.unitIndex);
	let specialruleIndex = Number(editorEvent.detail.specialruleIndex);
	switch (action)
	{
	case "set-warbandname":
		owc.editor.setWarbandName(editorEvent.detail.value);
		break;
	case "set-name":
		owc.editor.setUnitName(unitIndex, editorEvent.detail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-count":
		owc.editor.setUnitCount(unitIndex, Number(editorEvent.detail.value));
		owc.ui.printUnit(unitIndex);
		break;
	case "set-quality":
		owc.editor.setUnitQuality(unitIndex, Number(editorEvent.detail.value));
		owc.ui.printUnit(unitIndex);
		break;
	case "set-combat":
		owc.editor.setUnitCombatscore(unitIndex, Number(editorEvent.detail.value));
		owc.ui.printUnit(unitIndex);
		break;
	case "set-additionaltext":
		owc.editor.setSpecialruleText(unitIndex, specialruleIndex, editorEvent.detail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "addunit":
		owc.editor.addUnit();
		owc.ui.printWarband();
		break;
	case "addspecialrule":
		owc.editor.addSpecialrule(unitIndex, editorEvent.detail.value);
		owc.ui.printUnit(unitIndex);
		/* reset the specialrule select */
		editorEvent.detail.originalEvent.target.value = "";
		break;
	case "removespecialrule":
		owc.editor.removeSpecialrule(unitIndex, specialruleIndex);
		owc.ui.printUnit(unitIndex);
		break;
	case "showunitmenu":
		owc.ui.visualizer.unitMenu.popup(editorEvent.detail.originalEvent, unitIndex);
		break;
	case "duplicate":
		owc.editor.duplicateUnit(unitIndex);
		owc.ui.printWarband();
		break;
	case "copy":
		owc.editor.copyUnitToClipboard(unitIndex);
		break;
	case "pasteunit":
		owc.editor.addUnit(editorEvent.detail.unitcode);
		owc.ui.printWarband();
		break;
	case "remove":
		owc.editor.removeUnit(unitIndex, editorEvent.detail.value);
		owc.ui.printWarband();
		break;
	case "moveup":
		owc.editor.moveUnitUp(unitIndex, editorEvent.detail.value);
		owc.ui.printWarband();
		break;
	case "movedown":
		owc.editor.moveUnitDown(unitIndex, editorEvent.detail.value);
		owc.ui.printWarband();
		break;
	};
	if (owc.editor.undoer.snapshots.length !== undoPoints)
	{
		owc.storeWarband();
	};
};

owc.editor.buildSpecialrulesCollection = function ()
{
	owc.editor.specialrulesList = [];
	for (let key in owc.resources.data)
	{
		if (owc.settings.ruleScope.includes(owc.resources.data[key].scope) === true)
		{
			owc.editor.specialrulesList.push(
			{
				"key": key,
				"text": owc.helper.translate(key)
			}
			);
		};
	};
	owc.editor.specialrulesList.sort((a, b) => a.text.localeCompare(b.text));
};

owc.editor.manangeUnitClipboard = function ()
{
	let clipboardData = storager.retrieve(owc.editor.UNIT_CLIPBOARD_KEY);
	if (clipboardData !== null)
	{
		/* discard clipboard data if it's older than 30 minutes (#18) */
		let diffMinutes = Math.abs(clipboardData.date - Date.now()) / (1000 * 60);
		console.log(diffMinutes);
		if (diffMinutes > 30)
		{
			localStorage.removeItem(owc.editor.UNIT_CLIPBOARD_KEY);
			clipboardData.data = null;
		};
	};
	if (typeof owc.ui.visualizer.refreshPasteUnitButton === "function")
	{
		owc.ui.visualizer.refreshPasteUnitButton(clipboardData);
	};
};

owc.editor.setUndoPoint = function (undoText)
{
	owc.editor.undoer.saveSnapshot(owc.warband.toString(), undoText);
};

owc.editor.newWarband = function ()
{
	owc.warband.clear();
	owc.editor.addUnit();
	owc.editor.undoer.clear();
};

owc.editor.setWarbandName = function (newName)
{
	newName = newName.trim();
	if (owc.warband.name !== newName)
	{
		owc.editor.setUndoPoint("Rename warband");
		owc.warband.name = newName;
	};
	owc.ui.refreshWarbandName();
};

owc.editor.addUnit = function (unitCode = "")
{
	let newUnit = new Unit();
	if (unitCode !== "")
	{
		newUnit.fromString(unitCode, Warband.CURRENT_VERSION, owc.resources.data);
	};
	owc.editor.setUndoPoint("Add unit");
	owc.warband.units.push(newUnit);
};

owc.editor.duplicateUnit = function (unitIndex)
{
	owc.editor.setUndoPoint("Duplicate " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	let copiedUnit = new Unit();
	copiedUnit.fromString(owc.warband.units[unitIndex].toString(), Warband.CURRENT_VERSION, owc.resources.data);
	owc.warband.units.splice(unitIndex, 0, copiedUnit);
};

owc.editor.copyUnitToClipboard = function (unitIndex)
{
	storager.store(owc.editor.UNIT_CLIPBOARD_KEY, owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]), owc.warband.units[unitIndex].toString());
	owc.editor.manangeUnitClipboard();
};

owc.editor.removeUnit = function (unitIndex)
{
	owc.editor.setUndoPoint("Delete " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	owc.warband.units.splice(unitIndex, 1);
};

owc.editor.moveUnitUp = function (unitIndex)
{
	if (unitIndex > 0)
	{
		owc.editor.setUndoPoint("Move " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]) + " up");
		[owc.warband.units[unitIndex], owc.warband.units[unitIndex - 1]] = [owc.warband.units[unitIndex - 1], owc.warband.units[unitIndex]];
	};
};

owc.editor.moveUnitDown = function (unitIndex)
{
	if (unitIndex < owc.warband.units.length - 1)
	{
		owc.editor.setUndoPoint("Move " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]) + " down");
		[owc.warband.units[unitIndex], owc.warband.units[unitIndex + 1]] = [owc.warband.units[unitIndex + 1], owc.warband.units[unitIndex]];
	};
};

owc.editor.setUnitName = function (unitIndex, newName)
{
	newName = newName.trim();
	if (owc.warband.units[unitIndex].name !== newName)
	{
		owc.editor.setUndoPoint("Rename unit");
		owc.warband.units[unitIndex].name = newName;
	};
};

owc.editor.setUnitCount = function (unitIndex, newCount)
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
		owc.editor.setUndoPoint("Set count of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.units[unitIndex].count = newCount;
	};
};

owc.editor.setUnitQuality = function (unitIndex, newQuality)
{
	if (owc.warband.units[unitIndex].quality !== newQuality)
	{
		owc.editor.setUndoPoint("Set quality value of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.units[unitIndex].quality = newQuality;
	};
};

owc.editor.setUnitCombatscore = function (unitIndex, newCombatscore)
{
	if (owc.warband.units[unitIndex].combat !== newCombatscore)
	{
		owc.editor.setUndoPoint("Set combat value of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.units[unitIndex].combat = newCombatscore;
	};
};

owc.editor.addSpecialrule = function (unitIndex, specialruleKey)
{
	let nativeText = owc.resources.defaultText(specialruleKey);
	owc.editor.setUndoPoint("Add \"" + nativeText + "\" special rule to " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	if (owc.warband.units[unitIndex].addSpecialrule(specialruleKey, owc.resources.data) === true)
	{
		let specialrule = owc.resources.data[specialruleKey];
		if (specialrule.replaces !== undefined)
		{
			for (let r = 0, rr = specialrule.replaces.length; r < rr; r += 1)
			{
				for (let s = 0, ss = owc.warband.units[unitIndex].specialrules.length; s < ss; s += 1)
				{
					if (owc.warband.units[unitIndex].specialrules[s].key === specialrule.replaces[r])
					{
						owc.warband.units[unitIndex].specialrules.copyWithin(s, ss - 1);
						owc.warband.units[unitIndex].specialrules.pop();
						break;
					};
				}
			};
		};
	}
	else
	{
		owc.editor.undoer.undo();
	};
};

owc.editor.removeSpecialrule = function (unitIndex, specialruleIndex)
{
	let nativeText = owc.resources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
	owc.editor.setUndoPoint("Revoke \"" + nativeText + "\" special rule from " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	owc.warband.units[unitIndex].removeSpecialrule(specialruleIndex);
};

owc.editor.setSpecialruleText = function (unitIndex, specialruleIndex, newSpecialruleText)
{
	let nativeText = owc.resources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
	if (newSpecialruleText === "")
	{
		newSpecialruleText = "...";
	};
	if (owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText !== newSpecialruleText)
	{
		owc.editor.setUndoPoint("Specify \"" + nativeText + "\" special rule for " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText = newSpecialruleText;
	};
};
