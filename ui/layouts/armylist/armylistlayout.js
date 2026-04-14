/**
 * Unusual table-like layout; with inputs for desktop devices.
 */
class ArmylistLayout extends OwcDesktopLayout
{
	/** @type {"armylist"} No more abstract. */
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

	/** @override */
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

	/** @override */
	render ()
	{
		super.render();
		for (const unit of this.warband.units)
		{
			this.#updateUnitCountPrintElement(unit);
		}
		// Attach points pools to the first unit triggering that points pool.
		for (const [poolKey, pointspoolValue] of this.warband.pointsPools)
		{
			const poolingUnit = this.warband.units.find(u => u.specialrules.some(s => (s.key === poolKey)));
			{
				const pointspoolElement = /** @type {HTMLElement} */(pageSnippets.produce("/layouts/armylist/pointspool", {
					key: poolKey,
					label: this.localizer.translate(poolKey + "PointsPool"),
					points: pointspoolValue,
					/** @type {ElementEventHandler} */
					onPoolpointsBlur: (evt) => this.editor.setPointsPool(evt.currentTarget.dataset.key, Number(evt.currentTarget.textContent)),
				}));
				enhanceInputs(pointspoolElement);
				this.element.querySelector(`[data-id="${poolingUnit.id}"]`).appendChild(pointspoolElement);
			}
		}
	}
}

owc.editor.registerLayout(ArmylistLayout);
