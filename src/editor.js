// @ts-check
// ALL OK 2025-11-15
/**
 * An `OwcEditor` is a mediator between the {@linkcode OwcLayout} user interface and the {@linkcode Warband} data.
 * It receives events from the UI and performs corresponding actions on the data an updates visuals outside the
 * actual layout.
 */
class OwcEditor
{
	/**
	 * The layout currently in use.
	 * @type {OwcLayout}
	 */
	#currentLayout;

	/**
	 * @param {Warband} warband Warband to be edited.
	 * @param {OwcLocalizer} localizer Provider of localization functionality.
	 * @param {OwcSettings} settings Editor, display and other settings.
	 */
	constructor(warband, localizer, settings)
	{
		/** The warband that is currently beeing edited. */
		this.warband = warband;
		/** Provider of localization functionality. */
		this.localizer = localizer;
		/** Editor, display and other settings.  */
		this.settings = settings;
		/** Map of all registeres layout variants. */
		this.layouts = new Map();
		/** List of all possible unit quality values, both numeric and display text. */
		this.qualityValues = (function () { let q = []; for (let v = 2; v <= 6; v += 1) q.push({ key: v, label: v.toString() + "+" }); return q; })();
		/** List of all possible unit combat values, both numeric and display text. */
		this.combatValues = (function () { let c = []; for (let v = 6; v >= 0; v -= 1) c.push({ key: v, label: v.toString() }); return c; })();
		/** Checker for compliance of the current warband against all requirements of the rules. */
		this.validator = new WarbandValidator(this.warband, this.localizer);
		/** Track of all changes made to the warband and its units. @type {Array<OwcUndoerSnapshot>} */
		this.snapshots = [];
	}

	/** @returns A simple, sorted array of keys and localized texts of all specialrules included in the currently opted-in rulebooks. */
	get specialrulesList ()
	{
		return Array.from(this.warband.specialrulesDirectory.values())
			.filter(s => this.settings.ruleScope.includes(s.rulebook))
			.map(s => ({ key: s.key, label: this.localizer.translate(s.key) }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}

	/**
	 * The currently used layout.
	 */
	get layout ()
	{
		return this.#currentLayout.name;
	}
	set layout (val)
	{
		if (this.layouts.has(val))
		{
			this.#currentLayout = this.layouts.get(val);
			this.#currentLayout.render();
		}
		else
		{
			ui.wait();
			pageSnippets.import(`./layouts/${val}/pagesnippet.xml`)
				// Rendering is done when the loaded layout registeres itsetlf.
				.finally(() => ui.waitEnd());
		}
	}

	/**
	 * Registers a layout (by class, identified by the classes `static id` property) in this editor.
	 * @param {typeof OwcLayout} layoutClass Class (as descendant of {@linkcode OwcLayout}) of the layout to be registered.
	 */
	registerLayout (layoutClass)
	{
		const editorLayout = new layoutClass(this, this.localizer);
		this.layouts.set(editorLayout.name, editorLayout);
		console.log("Editor layout registered:", layoutClass.name, this.layouts.entries());
		this.layout = editorLayout.name;
	}

	/**
	 * Popup menu ith additional editing options for individual units.
	 * @type {Menubox2<Unit>}
	 */
	unitMenu = new Menubox2("unit-menu", {
		items: [
			{ key: "copy", label: "Copy unit", icon: "fa-solid fa-copy" },
			{ key: "duplicate", label: "Duplicate unit", icon: "fa-solid fa-clone fa-flip-vertical" },
			{ key: "separate", label: "Separate one figure", icon: "fa-solid fa-code-branch" },
			{ separator: true },
			{
				key: "move-before", label: "Move unit before", icon: "fa-solid fa-arrow-up",
				submenu: { items: [], align: { horizontal: "right", vertical: "below" } }
			},
			{
				key: "move-after", label: "Move unit after", icon: "fa-solid fa-arrow-down",
				submenu: { items: [], align: { horizontal: "right", vertical: "below" } }
			},
			{ separator: true },
			{ key: "delete", label: "Delete unit", icon: "fa-solid fa-trash", cssClasses: ["red"] },
		],
		itemRenderer: iconizedMenuitemRenderer,
		align: { horizontal: "right", vertical: "below" },
		beforePopup: (/** @type {Menubox2<Unit>} */mbx) =>
		{
			const unitToMenuItem = (/** @type {Unit} */unit) =>
			{
				return { key: unit.index.toString(), label: this.localizer.nonBlankUnitName(unit.name) };
			};
			const unit = mbx.context;
			const uIdx = unit.index;
			this.unitMenu.getItemByKey("separate").enabled = (unit.count > 1);
			const moveBeforeItem = this.unitMenu.getItemByKey("move-before");
			moveBeforeItem.submenu.replaceItems(unit.warband.units.slice(0, uIdx).map(unitToMenuItem));
			moveBeforeItem.enabled = (moveBeforeItem.submenu.items.length > 0);
			const moveAfterItem = this.unitMenu.getItemByKey("move-after");
			moveAfterItem.submenu.replaceItems(unit.warband.units.slice(uIdx + 1).map(unitToMenuItem));
			moveAfterItem.enabled = (moveAfterItem.submenu.items.length > 0);
		},
		/** @type {Menubox2Callback<Unit>} */
		callback: (itm) =>
		{
			const unit = itm.menubox.context;
			if ((itm.menubox.id === "unit-menu.move-before") || (itm.menubox.id === "unit-menu.move-after"))
			{
				this.moveUnit(unit, Number(itm.key));
			}
			else
			{
				switch (itm.key)
				{
					case "copy":
						this.clipboard.copyUnit(unit);
						this.render();
						break;
					case "duplicate":
						console.log(unit.id, this.warband.units);
						console.log(this.warband.units.findIndex(u => (u.id === unit.id)));
						this.addUnit(unit.clone(), this.warband.units.findIndex(u => (u.id === unit.id)));
						break;
					case "separate":
						this.separateUnit(unit);
						break;
					case "delete":
						this.deleteUnit(unit);
						break;
				}
			}
		},
	});

	/**
	 * Renders the current warband using the current layout into the document.
	 */
	render ()
	{
		this.#currentLayout?.render();
	}

	/**
	 * Applies any manipulation to the warband, an unit or a pools point. The actual manipulation is performed by the
	 * method given in the `action` argument.
	 *
	 * If the manipulation resulted in an actual change, a snapshot is taken, the warband is re-validated and its
	 * summary is updated.
	 *
	 * @param {string} label May by null to not create an undo entry.
	 * @param {() => any} action Method to be executed to apply the manipulation.
	 * @returns *true* if the manipluation yielded any actual change.
	 */
	#applyManipulation (label, action)
	{
		const prevWarbandCode = this.warband.toString();
		const prevWarbandPoints = this.warband.points;
		action();
		const newWarbandCode = this.warband.toString();
		const modified = (newWarbandCode !== prevWarbandCode);
		if (modified)
		{
			if (!!label)
			{
				this.snapshots.unshift({
					label: label,
					warbandCode: prevWarbandCode,
					pointsModification: this.warband.points - prevWarbandPoints,
				});
			}
			this.storeWarbandInBrowser();
		}
		return modified;
	}

	/**
	 * Reverts a change.
	 * @param {number} [count] Count of edits to be reverted.
	 */
	undo (count = 1)
	{
		if (this.snapshots.length > 0)
		{
			this.warband.fromString(this.snapshots.splice(0, count)[count - 1].warbandCode);
			this.storeWarbandInBrowser();
			this.render();
		}
	}

	/**
	 * Sets the warband's name.
	 * @param {string} str The new warband name.
	 */
	setWarbandName (str)
	{
		if (this.#applyManipulation(
			"Rename warband",
			() => this.warband.name = str.trim().replace(/\s+/g, " ")
		))
		{
			this.updateWindowTitle();
		}
	}

	/**
	 * Adds an unit to the warband.
	 * @param {Unit} [unit] Unit to be added. If omitted, a new unit with default combat and quality values is created.
	 * @param {number} [index] Zero-based index within the warband's units array where to insert the unit. If omitted, the unit is added at the end.
			 * @returns *false* to prevent any browser-default action on a button click.
	 */
	addUnit (unit, index)
	{
		if (this.#applyManipulation(
			(unit) ? `Duplicate ${this.localizer.nonBlankUnitName(unit.name)}` : "Add unit",
			() => this.warband.addUnit(unit, index)
		))
		{
			this.#currentLayout.render();
		}
		return false; // Prevent button actions on form.
	}

	/**
	 * Sets an unit's name.
	 * @param {Unit} unit The affected unit.
	 * @param {string} str The unit's new name.
	 */
	setUnitName (unit, str)
	{
		if (this.#applyManipulation(
			`Rename ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.name = str
		))
		{
			this.updateWarbandSummary();
		}
	}

	/**
	 * Sets the count of figures of an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {number} val The new count of figures of the unit.
	 */
	setUnitCount (unit, val)
	{
		if (this.#applyManipulation(
			`Set count of ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.count = val
		))
		{
			this.#currentLayout.updateUnitPoints(unit);
		}
	}

	/**
	 * Sets the quality value of an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {number} val The unit's new quality value.
	 */
	setUnitQuality (unit, val)
	{
		if (this.#applyManipulation(
			`Set quality value of ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.quality = val
		))
		{
			this.#currentLayout.updateUnitPoints(unit);
		}
	}

	/**
	 * Sets the combat value of an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {number} val The unit's new combat value.
	 */
	setUnitCombat (unit, val)
	{
		if (this.#applyManipulation(
			`Set combat value of ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.combat = val
		))
		{
			this.#currentLayout.updateUnitPoints(unit);
		}
	}

	/**
	 * Adds a specialrule to an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {string} specialruleKey The key of the specialrule to add. Refers to a key of the unit's warband's specialrulesDirectory.
	 */
	addUnitSpecialrule (unit, specialruleKey)
	{
		if (this.#applyManipulation(
			`Add "${this.warband.specialrulesDirectory.get(specialruleKey).label}" special rule to ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.addSpecialrule(specialruleKey)
		))
		{
			this.#currentLayout.render();
		}
	}

	/**
	 * Sets the additional text of a specifiable specialrule of an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {string} specialruleKey Key of the affected speciarule.
	 * @param {string} val The new addional text of the specifiable specialrule.
	 */
	setUnitSpecialruleAdditionalText (unit, specialruleKey, val)
	{
		const specialrule = unit.specialrules.find(s => (s.key === specialruleKey));
		if (this.#applyManipulation(
			`Specify "${this.warband.specialrulesDirectory.get(specialrule.key).label}" special rule on ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => specialrule.additionalText = val
		))
		{}
	}

	/**
	 * Removes a specialrule from an unit.
	 * @param {Unit} unit The affected unit.
	 * @param {string} specialruleKey Key of the speciarule to be removed.
	 */
	removeUnitSpecialrule (unit, specialruleKey)
	{
		if (this.#applyManipulation(
			`Revoke "${this.warband.specialrulesDirectory.get(specialruleKey).label}" special rule from ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => unit.removeSpecialrule(specialruleKey)
		))
		{
			this.#currentLayout.render();
		}
	}

	/**
	 * Moves an unit to another position within its warband.
	 * @param {Unit} unit The unit to be moved.
	 * @param {number} toIndex The unit's new zero-based index within its warband.
	 */
	moveUnit (unit, toIndex)
	{
		const units = unit.warband.units;
		const fromIndex = unit.index;
		if (this.#applyManipulation(
			`Move ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => units.splice(toIndex, 0, units.splice(fromIndex, 1)[0])
		))
		{
			this.#currentLayout.render();
		}
	}

	/**
	 * From a unit with more than one figure this separates one figure into a new unit.
	 * @param {Unit} unit Unit from which to separate one figure.
	 */
	separateUnit (unit)
	{
		if ((unit.count > 1) && this.#applyManipulation(
			`Separate ${this.localizer.nonBlankUnitName(unit.name)}`,
			() =>
			{
				const separate = unit.clone();
				unit.count -= 1; // Decrease the count of figure in the original unit by one.
				this.warband.addUnit(separate, this.warband.units.findIndex(u => (u.id === unit.id)) + 1);
			}
		))
		{
			this.#currentLayout.render();
		}
	}

	/**
	 * Removes an unit for the warband.
	 * @param {Unit} unit The unit to be removed.
	 */
	deleteUnit (unit)
	{
		const unitIndex = this.warband.units.findIndex(u => (u.id === unit.id));
		this.#applyManipulation(
			`Delete ${this.localizer.nonBlankUnitName(unit.name)}`,
			() => this.warband.removeUnit(unitIndex)
		);
		this.#currentLayout.render();
	}

	/**
	 * Assigns an amount of warband points in a points pool.
	 * @param {string} poolKey Key of the pool, referring to the pooling specialrule, to which to assign points.
	 * @param {number} value Count of points to assign to the points pool.
	 */
	setPointsPool (poolKey, value)
	{
		if (this.#applyManipulation(
			`Assign ${value} points in ${this.warband.specialrulesDirectory.get(poolKey).label} pool`,
			() => this.warband.pointsPools.set(poolKey, value)
		))
		{
			this.updateWarbandSummary();
		}
	}

	/**
	 * Updates the window title with _"\<warband name\> (\<points\>) \<title\>_".
	 */
	updateWindowTitle ()
	{
		document.title = this.localizer.nonBlankWarbandName(this.warband.name)
			+ ` (${this.warband.points} ${this.localizer.translate("points")}) - `
			+ owc.meta.title;
		document.getElementById("warband-print-code").textContent = this.warband.toString();
	}

	/**
	 * Updates the warband summary (total points, count of figures, personality points). Also performs a validation of
	 * the warband composition and prints any rule violations.
	 */
	updateWarbandSummary ()
	{
		const warbandStats = {
			FIGURECOUNT: this.warband.figureCount.toString(),
			TOTALPOINTS: this.warband.points.toString(),
			PERSONALITYPOINTS: this.warband.personalityPoints.toString(),
			PERSONALITYPERCENT: Math.floor(this.warband.personalityPoints / this.warband.points * 100).toString(),
		};
		let warbandSummary = this.localizer.translate((this.settings.options.countFigures) ? "totalFiguresAndPoints" : "totalPoints", warbandStats);
		if (this.warband.personalityPoints > 0)
		{
			warbandSummary += ` (${this.localizer.translate((this.settings.options.personalitiesInPoints) ? "personalitiesPoints" : "personalitiesPercent", warbandStats)})`;
		}
		const rulescheckResult = (this.settings.options.applyRuleChecks) ? this.validator.validate() : [];
		document.getElementById("totals").textContent = warbandSummary;
		document.getElementById("warband-warnings").replaceChildren(
			...rulescheckResult.map(r => makeElement("span.rule-violation", r))
		);
		this.updateWindowTitle();
	}

	/**
	 * Caches the current warband (if it is not empty) in the broswer's `localStorage` using the {@linkcode owc.warbandStorageKey}.
	 * @see {@linkcode Warband.isEmpty()}
	 */
	storeWarbandInBrowser ()
	{
		if (!this.warband.isEmpty)
		{
			localStorage?.setItem(owc.warbandStorageKey, JSON.stringify({
				title: this.warband.name,
				figures: this.warband.figureCount,
				points: this.warband.points,
				data: this.warband.toString(),
				date: (new Date()).toJSON()
			}));
		}
	}

	// DOC everyting from here
	clipboard = new class
	{
		/**
		 * @param {OwcEditor} parent
		 */
		constructor(parent)
		{
			this.STORAGE_KEY = "owc_clipboard";
			this.parent = parent;
		}

		/**
		 *
		 * @param {Unit} unit
		 */
		copyUnit (unit)
		{
			const TIME_TO_LIVE = 30; // minutes
			const clipboardUnit = unit.clone();
			/** @type {OwcClipboardData} */
			const clipboardData = {
				label: this.parent.localizer.nonBlankUnitName(clipboardUnit.name),
				data: clipboardUnit.toString(),
				expires: new Date(new Date().getTime() + TIME_TO_LIVE * 60 * 1000).toJSON()
			};
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clipboardData));
		}

		/** @returns {OwcClipboardData} */
		getData ()
		{
			this.cleanup();
			return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
		}

		cleanup ()
		{
			const clipboardData = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
			const expirationDate = Date.parse(clipboardData?.expires);
			if (!isNaN(expirationDate) && (Date.now() > expirationDate))
			{
				localStorage.removeItem(this.STORAGE_KEY);

			}
		}
	}(this);
}
