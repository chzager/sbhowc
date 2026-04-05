/**
 * Layout for classic unit profiles (as seen in the rule books), optimized with inputs for touch devices.
 */
class ClassicTouchLayout extends OwcLayout
{
	/** @type {"classic-touch"} No more abstract. */
	static id = "classic-touch";

	/**
	 * Menubox for setting a unit's quality value.
	 */
	#qualityMenu = new Menubox2("quality[classic-touch]", {
		items: [
			{ label: this.localizer.translate("quality") },
			...this.editor.qualityValues.map(q => ({ key: q.key.toString(), label: q.label }))
		],
		css: "touch-radio",
		align: { horizontal: "center", vertical: "middle" },
		beforePopup: (/** @type {Menubox2<Unit>} */mbx) =>
		{
			for (const checkedItem of mbx.getCheckedItems())
			{
				checkedItem.checked = false;
			}
			mbx.getItemByKey(mbx.context.quality.toString()).checked = true;
		},
		callback: (/** @type {Menubox2Item<Unit>} */mit) =>
		{
			this.editor.setUnitQuality(mit.menubox.context, Number(mit.key));
			this.editor.render();
		},
	});

	/**
	 * Menubox for setting a unit's combat value.
	 */
	#combatMenu = new Menubox2("combat[classic-touch]", {
		items: [
			{ label: this.localizer.translate("combat") },
			...this.editor.combatValues.map(q => ({ key: q.key.toString(), label: q.label }))
		],
		css: "touch-radio",
		align: { horizontal: "center", vertical: "middle" },
		beforePopup: (/** @type {Menubox2<Unit>} */mbx) =>
		{
			for (const checkedItem of mbx.getCheckedItems())
			{
				checkedItem.checked = false;
			}
			mbx.getItemByKey(mbx.context.combat.toString()).checked = true;
		},
		callback: (/** @type {Menubox2Item<Unit>} */mit) =>
		{
			this.editor.setUnitCombat(mit.menubox.context, Number(mit.key));
			this.editor.render();
		},
	});

	/** @inheritdoc */
	get snippetData ()
	{
		return {
			/**
			 * Renders elements for displaying and handling actions on an individual special rule within the given element.
			 * @param {HTMLElement} element The recipient element for the special rules.
			 * @param {OwcSpecialruleInstance} data The specific special rule to render.
			 */
			renderSpecialrule: (element, data) =>
			{
				const specialruleLocaleText = (this.localizer.has(data.key)) ? this.localizer.translate(data.key) : this.warband.specialrulesDirectory.get(data.key).label;
				if (specialruleLocaleText.includes("...") && data.additionalText)
				{
					const [textBefore, textAfter] = specialruleLocaleText.split("...");
					const displayText = [textBefore, data.additionalText, textAfter].join("\u0020").replaceAll(/\s{2,}/g, " ").trim();
					element.replaceChildren(makeElement("span", displayText));
				}
				else
				{
					element.replaceChildren(makeElement("span", specialruleLocaleText));
				}
				if (!this.editor.settings.ruleScope.includes(data.rulebook))
				{
					element.firstElementChild.classList.add("out-of-scope");
				}
			},

			/**
			 * Event handler for clicks on the warband name.
			 * Shows an input dialog to prompt the new warband name and applies it if confirmed.
			 * @type {AsyncElementEventHandler}
			 */
			promptWarbandName: async (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const newValue = await inputDialog.prompt(
					"text",
					this.localizer.translate("warbandNamePrompt"),
					this.warband.name
				);
				this.editor.setWarbandName(newValue);
				triggerElement.textContent = this.localizer.nonBlankWarbandName(newValue);
			},

			/**
			 * Event handler for clicks on a unit's name. Shows an input dialog to prompt for the unit's new name and applies it if confirmed.
			 * @type {AsyncElementEventHandler}
			 */
			promptUnitName: async (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const unit = this.getEventUnit(evt);
				const newValue = await inputDialog.prompt(
					"text",
					this.localizer.translate("unitNamePrompt"),
					unit.name
				);
				this.editor.setUnitName(unit, newValue);
				triggerElement.textContent = this.localizer.nonBlankUnitName(newValue);
			},

			/**
			 * Event handler for clicks on a unit's count. Shows an input dialog to prompt for the unit's new count and applies it if confirmed.
			 * @type {AsyncElementEventHandler<HTMLInputElement>}
			 */
			promptUnitCount: async (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const unit = this.getEventUnit(evt);
				const newValue = await inputDialog.prompt(
					"number",
					this.localizer.translate("countOfUnit", { UNIT: this.localizer.nonBlankUnitName(unit.name) }),
					unit.count,
					1
				);
				this.editor.setUnitCount(unit, newValue);
				triggerElement.textContent = `x${newValue}`;
			},

			/**
			 * Event handler for clicks on a unit's quality value. Shows a menu to select the unit's new quality value and applies it.
			 * @type {ElementEventHandler<HTMLElement,PointerEvent>}
			 */
			promptQuality: (evt) => this.#qualityMenu.popup(evt, this.getEventUnit(evt)),

			/**
			 * Event handler for clicks on a unit's combat value. Shows a menu to select the unit's new combat value and applies it.
			 * @type {ElementEventHandler<HTMLElement,PointerEvent>}
			 */
			promptCombat: (evt) => this.#combatMenu.popup(evt, this.getEventUnit(evt)),

			/**
			 * Event handler for clicks on a points pool. Shows an input dialog to prompt for the points in that pool and applies them if confirmed.
			 * @type {AsyncElementEventHandler}
			 */
			promptPoolPoints: async (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const poolKey = evt.currentTarget.dataset.key;
				const newValue = await inputDialog.prompt(
					"number",
					this.localizer.translate("prompt.pointsPool.title", { POOL: this.localizer.translate(poolKey + "PointsPool") }),
					this.warband.pointsPools.get(poolKey),
					0
				);
				triggerElement.textContent = `${newValue ?? 0} ${this.localizer.translate("points")}`;
				this.editor.setPointsPool(poolKey, newValue);
			},
		};
	};
}

pageSnippets
	.import(absoluteUrl("components/inputDialog/component.xml"))
	.then(() => owc.editor.registerLayout(ClassicTouchLayout));
