// @ts-check
/**
 * Unusual table-like layout; with inputs for desktop devices.
 */
class ArmylistLayout extends OwcDesktopLayout
{
	/** @inheritdoc */
	static id = "armylist";

	/**
	 * The "unit count print element" is a print-only `<div>` element in the layout. Whenever the value
	 * of the unit count `<input>` element changes, this function updates the content of this hidden
	 * print-only element.
	 * @param {Unit} unit Affected unit.
	 */
	#updateUnitCountPrintElement (unit)
	{
		/** @type {HTMLElement} */
		const countPrinterElement = this.element.querySelector(`[data-id="${unit.id}"] [name="count-printer"]`);
		countPrinterElement.textContent = `${unit.count}x`;
		countPrinterElement.style.display = (unit.count > 1) ? "initial" : "none";
	}

	/** @inheritdoc */
	get snippetData ()
	{
		return Object.assign(super.snippetData,
			{
				/** @type {ElementEventHandler<HTMLInputElement>} */
				onUnitCountChanged: (evt) =>
				{
					super.snippetData.onUnitCountChanged(evt);
					this.#updateUnitCountPrintElement(this.getEventUnit(evt));
				}
			});
	}

	/** @inheritdoc */
	render ()
	{
		super.render();
		for (const unit of this.warband.units)
		{
			this.#updateUnitCountPrintElement(unit);
		}
		// Attach points pools to the first unit triggering that points pool.
		for (const [pointspoolKey, pointspoolValue] of this.warband.pointsPools)
		{
			const poolingUnit = this.warband.units.find(u => u.specialrules.some(s => (s.key === pointspoolKey)));
			{
				const pointspoolElement = /** @type {HTMLElement} */(pageSnippets.produce("/layouts/armylist/pointspool", {
					key: pointspoolKey,
					label: this.localizer.translate(pointspoolKey + "PointsPool"),
					points: pointspoolValue,
					/** @type {ElementEventHandler} */
					setPoolPoints: (evt) => this.editor.setPointsPool(evt.currentTarget.dataset.key, Number(evt.currentTarget.textContent)),
				}));
				inputHelper.attach(pointspoolElement);
				this.element.querySelector(`[data-id="${poolingUnit.id}"]`).appendChild(pointspoolElement);
			}
		}
	}
}

owc.editor.registerLayout(ArmylistLayout);
