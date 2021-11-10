"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

owc.editor =
{
	undoer: new Undoer(),
	specialrulesList: [],
	qualityValues: (function (){let q = [];for (let v = 2; v <= 6; v += 1) q.push({key: v, label: v.toString() + "+"});return q;})(),
	combatValues: (function (){let c = [];for (let v = 6; v >= 0; v -= 1) c.push({key: v, label: v.toString()});return c;})()
};

owc.editor.init = function ()
{
	window.addEventListener("editor", owc.editor.onEditorEvent);
};

owc.editor.onEditorEvent = function (editorEvent)
{
	let eventDetail = editorEvent.detail;
	let action = editorEvent.detail.action ?? "set-" + eventDetail.editor;
	console.debug("owc.editor.onEditorEvent()", action, eventDetail);
	let undoPoints = owc.editor.undoer.snapshots.length;
	let unitIndex = eventDetail.unitIndex;
	let specialruleIndex = eventDetail.specialruleIndex;
	switch (action)
	{
	case "set-warbandname":
		owc.editor.setWarbandName(eventDetail.value);
		break;
	case "set-name":
		owc.editor.setUnitName(unitIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-count":
		owc.editor.setUnitCount(unitIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-quality":
		owc.editor.setUnitQuality(unitIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-combat":
		owc.editor.setUnitCombatscore(unitIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-specialrules":
		owc.editor.setSpecialrules(unitIndex, eventDetail.value);
		owc.warband.checkPointsPools();
		owc.ui.printUnit(unitIndex);
		break;
	case "set-additionaltext":
		owc.editor.setSpecialruleText(unitIndex, specialruleIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		break;
	case "set-pointspool":
		owc.editor.setPointsPool(eventDetail.poolname, eventDetail.value);
		owc.ui.visualizer.refreshWarbandSummary();
		owc.ui.refreshUndoButton();
		break;
	case "addunit":
		owc.editor.addUnit();
		owc.ui.printWarband();
		owc.ui.scrollToBottom();
		break;
	case "addspecialrule":
		owc.editor.addSpecialrule(unitIndex, eventDetail.value);
		owc.ui.printUnit(unitIndex);
		/* reset the specialrule select */
		eventDetail.originalEvent.target.value = "";
		break;
	case "removespecialrule":
		owc.editor.removeSpecialrule(unitIndex, specialruleIndex);
		owc.ui.printUnit(unitIndex);
		break;
	case "showunitmenu":
		owc.ui.visualizer.unitMenu.popup(eventDetail.originalEvent, unitIndex);
		break;
	case "duplicate":
		owc.editor.duplicateUnit(unitIndex);
		owc.ui.printWarband();
		break;
	case "copy":
		owc.editor.clipboard.copyUnit(unitIndex);
		owc.ui.printWarband();
		break;
	case "pasteunit":
		owc.editor.addUnit(eventDetail.unitcode);
		owc.ui.printWarband();
		owc.ui.scrollToBottom();
		break;
	case "remove":
		owc.editor.removeUnit(unitIndex, eventDetail.value);
		owc.ui.printWarband();
		break;
	case "moveup":
		owc.editor.moveUnitUp(unitIndex, eventDetail.value);
		owc.ui.printWarband();
		break;
	case "movedown":
		owc.editor.moveUnitDown(unitIndex, eventDetail.value);
		owc.ui.printWarband();
		break;
	};
	if (owc.editor.undoer.snapshots.length !== undoPoints)
	{
		owc.cache.update();
	};
};

owc.editor.buildSpecialrulesCollection = function ()
{
	owc.editor.specialrulesList = [];
	for (let key in owc.resources.data)
	{
		if (owc.settings.ruleScope.includes(owc.resources.data[key].scope))
		{
			owc.editor.specialrulesList.push(
			{
				key: key,
				text: owc.helper.translate(key)
			}
			);
		};
	};
	owc.editor.specialrulesList.sort((a, b) => a.text.localeCompare(b.text));
};

owc.editor.setUndoPoint = function (undoText)
{
	if (owc.ui.undoButton !== null)
	{
		owc.ui.undoButton.classList.add("animated");
	};
	owc.editor.undoer.saveSnapshot(owc.warband.toString(), undoText);
};

owc.editor.undo = function ()
{
	if (owc.editor.undoer.canUndo)
	{
		owc.ui.undoButton.classList.add("animated");
		owc.warband.fromString(owc.editor.undoer.undo(), owc.resources.data);
		owc.ui.printWarband();
		owc.cache.update();
	};
};

owc.editor.newWarband = function ()
{
	owc.warband.clear();
	owc.editor.addUnit();
	owc.editor.undoer.clear();
};

owc.editor.setWarbandName = function (newName)
{
	newName = newName.replaceAll(/@/g, "X").trim();
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
	}
	else
	{
		newUnit.quality = owc.settings.defaults.quality;
		newUnit.combat = owc.settings.defaults.combat;
	};
	owc.editor.setUndoPoint("Add unit");
	owc.warband.addUnit(newUnit);
};

owc.editor.duplicateUnit = function (unitIndex)
{
	owc.editor.setUndoPoint("Duplicate " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	let copiedUnit = new Unit();
	copiedUnit.fromString(owc.warband.units[unitIndex].toString(), Warband.CURRENT_VERSION, owc.resources.data);
	owc.warband.units.splice(unitIndex, 0, copiedUnit);
};

owc.editor.removeUnit = function (unitIndex)
{
	owc.editor.setUndoPoint("Delete " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
	owc.warband.removeUnit(unitIndex);
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
	newName = newName.replaceAll(/[@!]/g, "X").trim();
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
	if (owc.warband.units[unitIndex].addSpecialrule(specialruleKey, owc.resources.data) !== true)
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

owc.editor.setSpecialrules = function (unitIndex, sepcialruleKeys)
{
	let unit = owc.warband.units[unitIndex];
	owc.editor.setUndoPoint("Modify special rules of " + owc.helper.nonBlankUnitName(unit));
	unit.specialrules.splice(0, unit.specialrules.length);
	for (let selectedKey of sepcialruleKeys)
	{
		unit.addSpecialrule(selectedKey.substr(0, 2), owc.resources.data);
		if (selectedKey.includes("."))
		{
			unit.specialrules[unit.specialrules.length - 1].additionalText = selectedKey.substr(3);
		};
	};
};

owc.editor.setSpecialruleText = function (unitIndex, specialruleIndex, newSpecialruleText)
{
	newSpecialruleText = newSpecialruleText.replaceAll(/[@!]/g, "X").trim();
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

owc.editor.setPointsPool = function (poolname, value)
{
	if (owc.warband.pointsPools[poolname] !== value)
	{
		owc.editor.setUndoPoint("Set \"" + owc.helper.translate(poolname) + "\" to " + value);
		owc.warband.pointsPools[poolname] = value;
	};
};

owc.editor.clipboard = {
	UNIT_KEY: "owc.editor.clipboard.unit",
	copyUnit: (unitIndex) =>
	{
		const TIME_TO_LIVE = 30; // minutes
		let clipboardUnit = Object.assign(new Unit(), owc.warband.units[unitIndex]);
		clipboardUnit.count = 1;
		let clipboardData =
		{
			name: owc.helper.nonBlankUnitName(clipboardUnit),
			code: clipboardUnit.toString(),
			expires: (new Date()).addMinutes(TIME_TO_LIVE).toISOString()
		};
		localStorage.setItem(owc.editor.clipboard.UNIT_KEY, JSON.stringify(clipboardData));
	},
	getUnit: () =>
	{
		owc.editor.clipboard.cleanup();
		return JSON.parse(localStorage.getItem(owc.editor.clipboard.UNIT_KEY));
	},
	cleanup: () =>
	{
		for (let key in localStorage)
		{
			if (key.startsWith("owc.editor.clipboard."))
			{
				let clipboardData = JSON.parse(localStorage.getItem(key));
				/* discard expired data ; based on (#18) */
				if ((isNaN(Date.parse(clipboardData.expires)) === false) && (Date.now() > (new Date()).fromIsoString(clipboardData.expires)))
				{
					localStorage.removeItem(key);
				}
			}
		}
	}
};
