/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

/* FILE IN PROGRESS */

let owcEditor =
{
	undoer: new Undoer(),
	specialrulesList: [],
	qualityValues: (function () { let q = []; for (let v = 2; v <= 6; v += 1) q.push({ key: v, label: v.toString() + "+" }); return q; })(),
	combatValues: (function () { let c = []; for (let v = 6; v >= 0; v -= 1) c.push({ key: v, label: v.toString() }); return c; })(),

	init: function ()
	{
		window.addEventListener("editor", owcEditor.onEditorEvent);
	},

	onEditorEvent: function (editorEvent)
	{
		let eventDetail = editorEvent.detail;
		let action = editorEvent.detail.action ?? "set-" + eventDetail.editor;
		console.debug("owcEditor.onEditorEvent()", action, eventDetail);
		let undoPoints = owcEditor.undoer.snapshots.length;
		let unitIndex = eventDetail.unitIndex;
		let specialruleIndex = eventDetail.specialruleIndex;
		switch (action)
		{
			case "set-warbandname":
				owcEditor.setWarbandName(eventDetail.value);
				break;
			case "set-name":
				owcEditor.setUnitName(unitIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				break;
			case "set-count":
				owcEditor.setUnitCount(unitIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				break;
			case "set-quality":
				owcEditor.setUnitQuality(unitIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				break;
			case "set-combat":
				owcEditor.setUnitCombatscore(unitIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				break;
			case "set-specialrules":
				owcEditor.setSpecialrules(unitIndex, eventDetail.value);
				owc.warband.checkPointsPools();
				owc.ui.printUnit(unitIndex);
				break;
			case "set-additionaltext":
				owcEditor.setSpecialruleText(unitIndex, specialruleIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				break;
			case "set-pointspool":
				owcEditor.setPointsPool(eventDetail.poolname, eventDetail.value);
				owc.ui.visualizer.refreshWarbandSummary();
				owc.ui.refreshUndoButton();
				break;
			case "addunit":
				owcEditor.addUnit();
				owc.ui.printWarband();
				owc.ui.scrollToBottom();
				break;
			case "addspecialrule":
				owcEditor.addSpecialrule(unitIndex, eventDetail.value);
				owc.ui.printUnit(unitIndex);
				/* reset the specialrule select */
				eventDetail.originalEvent.target.value = "";
				break;
			case "removespecialrule":
				owcEditor.removeSpecialrule(unitIndex, specialruleIndex);
				owc.ui.printUnit(unitIndex);
				break;
			case "showunitmenu":
				owc.ui.visualizer.unitMenu.popup(eventDetail.originalEvent, unitIndex);
				break;
			case "duplicate":
				owcEditor.duplicateUnit(unitIndex);
				owc.ui.printWarband();
				break;
			case "copy":
				owcEditor.clipboard.copyUnit(unitIndex);
				owc.ui.printWarband();
				break;
			case "pasteunit":
				owcEditor.addUnit(eventDetail.unitcode);
				owc.ui.printWarband();
				owc.ui.scrollToBottom();
				break;
			case "remove":
				owcEditor.removeUnit(unitIndex, eventDetail.value);
				owc.ui.printWarband();
				break;
			case "moveup":
				owcEditor.moveUnitUp(unitIndex, eventDetail.value);
				owc.ui.printWarband();
				break;
			case "movedown":
				owcEditor.moveUnitDown(unitIndex, eventDetail.value);
				owc.ui.printWarband();
				break;
		};
		if (owcEditor.undoer.snapshots.length !== undoPoints)
		{
			owcCache.update();
		};
	},

	buildSpecialrulesCollection: function ()
	{
		owcEditor.specialrulesList = [];
		for (let key in owcResources.data)
		{
			if (owcSettings.ruleScope.includes(owcResources.data[key].scope))
			{
				owcEditor.specialrulesList.push(
					{
						key: key,
						text: owc.helper.translate(key)
					}
				);
			};
		};
		owcEditor.specialrulesList.sort((a, b) => a.text.localeCompare(b.text));
	},

	setUndoPoint: function (undoText)
	{
		if (owc.ui.undoButton !== null)
		{
			owc.ui.undoButton.classList.add("animated");
		};
		owcEditor.undoer.saveSnapshot(owc.warband.toString(), undoText);
	},

	undo: function ()
	{
		if (owcEditor.undoer.canUndo)
		{
			owc.ui.undoButton.classList.add("animated");
			owc.warband.fromString(owcEditor.undoer.undo(), owcResources.data);
			owc.ui.printWarband();
			owcCache.update();
		};
	},

	newWarband: function ()
	{
		owc.warband.clear();
		owcEditor.addUnit();
		owcEditor.undoer.clear();
	},

	setWarbandName: function (newName)
	{
		newName = newName.replaceAll(/@/g, "X").trim();
		if (owc.warband.name !== newName)
		{
			owcEditor.setUndoPoint("Rename warband");
			owc.warband.name = newName;
		};
		owc.ui.refreshWarbandName();
	},

	addUnit: function (unitCode = "")
	{
		let newUnit = new Unit();
		if (unitCode !== "")
		{
			newUnit.fromString(unitCode, Warband.CURRENT_VERSION, owcResources.data);
		}
		else
		{
			newUnit.quality = owcSettings.defaults.quality;
			newUnit.combat = owcSettings.defaults.combat;
		};
		owcEditor.setUndoPoint("Add unit");
		owc.warband.addUnit(newUnit);
	},

	duplicateUnit: function (unitIndex)
	{
		owcEditor.setUndoPoint("Duplicate " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		let copiedUnit = new Unit();
		copiedUnit.fromString(owc.warband.units[unitIndex].toString(), Warband.CURRENT_VERSION, owcResources.data);
		owc.warband.units.splice(unitIndex, 0, copiedUnit);
	},

	removeUnit: function (unitIndex)
	{
		owcEditor.setUndoPoint("Delete " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.removeUnit(unitIndex);
	},

	moveUnitUp: function (unitIndex)
	{
		if (unitIndex > 0)
		{
			owcEditor.setUndoPoint("Move " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]) + " up");
			[owc.warband.units[unitIndex], owc.warband.units[unitIndex - 1]] = [owc.warband.units[unitIndex - 1], owc.warband.units[unitIndex]];
		};
	},

	moveUnitDown: function (unitIndex)
	{
		if (unitIndex < owc.warband.units.length - 1)
		{
			owcEditor.setUndoPoint("Move " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]) + " down");
			[owc.warband.units[unitIndex], owc.warband.units[unitIndex + 1]] = [owc.warband.units[unitIndex + 1], owc.warband.units[unitIndex]];
		};
	},

	setUnitName: function (unitIndex, newName)
	{
		newName = newName.replaceAll(/[@!]/g, "X").trim();
		if (owc.warband.units[unitIndex].name !== newName)
		{
			owcEditor.setUndoPoint("Rename unit");
			owc.warband.units[unitIndex].name = newName;
		};
	},

	setUnitCount: function (unitIndex, newCount)
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
			owcEditor.setUndoPoint("Set count of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
			owc.warband.units[unitIndex].count = newCount;
		};
	},

	setUnitQuality: function (unitIndex, newQuality)
	{
		if (owc.warband.units[unitIndex].quality !== newQuality)
		{
			owcEditor.setUndoPoint("Set quality value of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
			owc.warband.units[unitIndex].quality = newQuality;
		};
	},

	setUnitCombatscore: function (unitIndex, newCombatscore)
	{
		if (owc.warband.units[unitIndex].combat !== newCombatscore)
		{
			owcEditor.setUndoPoint("Set combat value of " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
			owc.warband.units[unitIndex].combat = newCombatscore;
		};
	},

	addSpecialrule: function (unitIndex, specialruleKey)
	{
		let nativeText = owcResources.defaultText(specialruleKey);
		owcEditor.setUndoPoint("Add \"" + nativeText + "\" special rule to " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		if (owc.warband.units[unitIndex].addSpecialrule(specialruleKey, owcResources.data) !== true)
		{
			owcEditor.undoer.undo();
		};
	},

	removeSpecialrule: function (unitIndex, specialruleIndex)
	{
		let nativeText = owcResources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
		owcEditor.setUndoPoint("Revoke \"" + nativeText + "\" special rule from " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
		owc.warband.units[unitIndex].removeSpecialrule(specialruleIndex);
	},

	setSpecialrules: function (unitIndex, sepcialruleKeys)
	{
		let unit = owc.warband.units[unitIndex];
		owcEditor.setUndoPoint("Modify special rules of " + owc.helper.nonBlankUnitName(unit));
		unit.specialrules.splice(0, unit.specialrules.length);
		for (let selectedKey of sepcialruleKeys)
		{
			unit.addSpecialrule(selectedKey.substr(0, 2), owcResources.data);
			if (selectedKey.includes("."))
			{
				unit.specialrules[unit.specialrules.length - 1].additionalText = selectedKey.substr(3);
			};
		};
	},

	setSpecialruleText: function (unitIndex, specialruleIndex, newSpecialruleText)
	{
		newSpecialruleText = newSpecialruleText.replaceAll(/[@!]/g, "X").trim();
		let nativeText = owcResources.defaultText(owc.warband.units[unitIndex].specialrules[specialruleIndex].key);
		if (newSpecialruleText === "")
		{
			newSpecialruleText = "...";
		};
		if (owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText !== newSpecialruleText)
		{
			owcEditor.setUndoPoint("Specify \"" + nativeText + "\" special rule for " + owc.helper.nonBlankUnitName(owc.warband.units[unitIndex]));
			owc.warband.units[unitIndex].specialrules[specialruleIndex].additionalText = newSpecialruleText;
		};
	},

	setPointsPool: function (poolname, value)
	{
		if (owc.warband.pointsPools[poolname] !== value)
		{
			owcEditor.setUndoPoint("Set \"" + owc.helper.translate(poolname) + "\" to " + value);
			owc.warband.pointsPools[poolname] = value;
		};
	},

	clipboard: { // TODO
		UNIT_KEY: "owcEditor.clipboard.unit",
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
			localStorage.setItem(owcEditor.clipboard.UNIT_KEY, JSON.stringify(clipboardData));
		},
		getUnit: () =>
		{
			owcEditor.clipboard.cleanup();
			return JSON.parse(localStorage.getItem(owcEditor.clipboard.UNIT_KEY));
		},
		cleanup: () =>
		{
			for (let key in localStorage)
			{
				if (key.startsWith("owcEditor.clipboard."))
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
	}
};