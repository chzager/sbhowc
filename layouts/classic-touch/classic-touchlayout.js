// @ts-check
// DOC entire file
/**
 * Layout for classic unit profiles as known from the rulebooks; with inputs for touch devices.
 */
class ClassicTouchLayout extends OwcLayout
{
	/** @inheritdoc */
	static id = "classic-touch";

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
			 * Renders elements that display and receive actions on an individual specialrule onto this element.
			 * @param {HTMLElement} element The receipient element for the specialrules.
			 * @param {OwcSpecialruleInstance} data The explicit specialrule to be rendered.
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

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			promptWarbandName: (evt) =>
			{
				const triggerElement = evt.currentTarget;
				inputDialog.prompt(
					"text",
					this.localizer.translate("warbandNamePrompt"),
					this.warband.name
				).then(newValue =>
				{
					this.editor.setWarbandName(newValue);
					triggerElement.textContent = newValue;
				});
			},

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			promptUnitName: (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const unit = this.getEventUnit(evt);
				inputDialog.prompt(
					"text",
					this.localizer.translate("unitNamePrompt"),
					unit.name
				).then(newValue =>
				{
					this.editor.setUnitName(unit, newValue);
					triggerElement.textContent = newValue;
				});
			},

			/** @type {ElementEventHandler<HTMLInputElement, UIEvent>} */
			promptUnitCount: (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const unit = this.getEventUnit(evt);
				inputDialog.prompt(
					"number",
					this.localizer.translate("unitNamePrompt"),
					unit.count,
					1
				).then(newValue =>
				{
					this.editor.setUnitCount(unit, newValue);
					triggerElement.textContent = `x${newValue}`;
				});
			},

			/** @param {PointerEvent} evt */
			promptQuality: (evt) => this.#qualityMenu.popup(evt, this.getEventUnit(evt)),

			/** @param {PointerEvent} evt */
			promptCombat: (evt) => this.#combatMenu.popup(evt, this.getEventUnit(evt)),

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			promptPoolPoints: (evt) =>
			{
				const triggerElement = evt.currentTarget;
				const poolKey = evt.currentTarget.dataset.key;

				inputDialog.prompt(
					"number",
					this.localizer.translate("prompt.pointsPool.title"),
					this.warband.pointsPools.get(poolKey),
					0
				).then(newValue =>
				{
					triggerElement.textContent = `${newValue ?? 0} ${this.localizer.translate("points")}`;
					this.editor.setPointsPool(poolKey, newValue);
				});
			},
		};
	};

	render ()
	{
		Promise.all([
			pageSnippets.hasSnippet("/components/inputPrompt") || pageSnippets.import(absoluteUrl("components/inputDialog/component.xml")),
		]).then(() =>
		{
			super.render();
		});
	}
}

owc.editor.registerLayout(ClassicTouchLayout);
