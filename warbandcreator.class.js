"use strict";

class WarbandCreator
{
	static UnitClipboardKey = "owcUnitClipboard";
	
	constructor(settings, resources)
	{
		this.settings = settings;
		this.resources = resources;
		this.warband = new Warband();
		this.undoer = new Undoer();
		this.newWarband();
	};

	setUndoPoint(undoText)
	{
		this.undoer.saveSnapshot(this.warband.toString(), undoText);
	};

	undo()
	{
		this.undoer.undo();
	};

	newWarband()
	{
		this.warband.clear();
		this.addUnit();
		this.undoer.clear();
	};

	setWarbandName(newName)
	{
		newName = newName.trim();
		if (this.warband.name !== newName)
		{
			this.setUndoPoint("Rename warband");
			this.warband.name = newName;
		};
	};

	addUnit(unitCode = "")
	{
		let newUnit = new Unit();
		if (unitCode !== "")
		{
			newUnit.fromString(unitCode, Warband.CurrentDataVersion, this.resources);
		};
		this.setUndoPoint("Add new unit");
		this.warband.units.push(newUnit);
	};

	duplicateUnit(unitIndex)
	{
		this.setUndoPoint("Duplicate " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
		let copiedUnit = new Unit();
		copiedUnit.fromString(this.warband.units[unitIndex].toString(), Warband.CurrentDataVersion, this.resources);
		this.warband.units.splice(unitIndex, 0, copiedUnit);
	};

	copyUnitToClipboard(unitIndex)
	{
		if (typeof localStorage !== "undefined")
		{
			let cliboardItem = {
				"name": this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")),
				"code": this.warband.units[unitIndex].toString()
			};
			localStorage.setItem(WarbandCreator.UnitClipboardKey, JSON.stringify(cliboardItem));
			window.dispatchEvent(new Event("focus"));
		}
		else
		{
			console.warn("localStorage not availible. Can not copy unit.");
		};
	};

	getUnitFromClipboard()
	{
		let result = null;
		if (typeof localStorage !== "undefined")
		{
			result = JSON.parse(localStorage.getItem(WarbandCreator.UnitClipboardKey));
		};
		return result;
	};
	
	removeUnit(unitIndex)
	{
		this.setUndoPoint("Delete " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
		this.warband.units.remove(unitIndex);
	};

	moveUnitUp(unitIndex)
	{
		if (unitIndex > 0)
		{
			this.warband.units.swap(unitIndex, unitIndex - 1);
		};
	};

	moveUnitDown(unitIndex)
	{
		if (unitIndex < this.warband.units.length - 1)
		{
			this.warband.units.swap(unitIndex + 1, unitIndex);
		};
	};

	setUnitName(unitIndex, newName)
	{
		newName = newName.trim();
		if (this.warband.units[unitIndex].name !== newName)
		{
			this.setUndoPoint("Rename unit");
			this.warband.units[unitIndex].name = newName;
		};
	};

	setUnitCount(unitIndex, newCount)
	{
		if ((isFinite(newCount) === false) || (newCount < 1))
		{
			newCount = 1;
		};
		if (newCount > 25)
		{
			newCount = 25;
		};
		if (this.warband.units[unitIndex].count !== newCount)
		{
			this.setUndoPoint("Set count of " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
			this.warband.units[unitIndex].count = newCount;
		};
	};

	setUnitQuality(unitIndex, newQuality)
	{
		if (this.warband.units[unitIndex].quality !== newQuality)
		{
			this.setUndoPoint("Set quality value of " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
			this.warband.units[unitIndex].quality = newQuality;
		};
	};

	setUnitCombatscore(unitIndex, newCombatscore)
	{
		if (this.warband.units[unitIndex].combat !== newCombatscore)
		{
			this.setUndoPoint("Set combat value of " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
			this.warband.units[unitIndex].combat = newCombatscore;
		};
	};

	addSpecialrule(unitIndex, specialruleKey)
	{
		let nativeText = this.resources.defaultText(specialruleKey);
		this.setUndoPoint("Add \"" + nativeText + "\" special rule to " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
		if (this.warband.units[unitIndex].addSpecialrule(specialruleKey, this.resources) === true)
		{
			let specialrule = this.resources.data[specialruleKey];
			if (specialrule.replaces !== undefined)
			{
				for (let r = 0; r < specialrule.replaces.length; r += 1)
				{
					for (let s = 0; s < this.warband.units[unitIndex].specialrules.length; s += 1)
					{
						if (this.warband.units[unitIndex].specialrules[s].key === specialrule.replaces[r])
						{
							this.warband.units[unitIndex].removeSpecialrule(specialrule.replaces[r]);
						};
					}
				};
			};
		}
		else
		{
			this.undo();
		};
	};

	removeSpecialrule(unitIndex, specialruleIndex)
	{
		let nativeText = this.resources.defaultText(this.warband.units[unitIndex].specialrules[specialruleIndex].key);
		this.setUndoPoint("Revoke \"" + nativeText + "\" special rule from " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
		this.warband.units[unitIndex].removeSpecialrule(specialruleIndex);
	};

	setSpecialruleText(unitIndex, specialruleIndex, newSpecialruleText)
	{
		let nativeText = this.resources.defaultText(this.warband.units[unitIndex].specialrules[specialruleIndex].key);
		if (newSpecialruleText === "")
		{
			newSpecialruleText = "...";
		};
		if (this.warband.units[unitIndex].specialrules[specialruleIndex].additionalText !== newSpecialruleText)
		{
			this.setUndoPoint("Specify \"" + nativeText + "\" special rule for " + this.warband.units[unitIndex].name.notEmpty(this.resources.defaultText("defaultUnitName")));
			this.warband.units[unitIndex].specialrules[specialruleIndex].additionalText = newSpecialruleText;
		};
	};

};
