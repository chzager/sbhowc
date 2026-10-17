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
		const countPrinterElement = this.element.querySelector(`[data-id="${unit.id}"] [name="count-printer"]`);
		countPrinterElement.textContent = `${unit.count}x`;
		countPrinterElement.style.display = (unit.count > 1) ? "initial" : "none";
	}

	/** @override */
	get snippetData ()
	{
		return {
			...super.snippetData,
			onUnitCountChanged: (/** @type {UIEvent<HTMLInputElement>} */ev) =>
			{
				super.snippetData.onUnitCountChanged(ev);
				this.#updateUnitCountPrintElement(this.getEventUnit(ev));
			}
		};
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
				const pointspoolElement = pageSnippets.produce("/layouts/armylist/pointspool", {
					key: poolKey,
					label: this.localizer.translate(poolKey + "PointsPool"),
					points: pointspoolValue,
					onPoolpointsBlur: (/** @type {UIEvent} */ev) => this.editor.setPointsPool(ev.currentTarget.dataset.key, Number(ev.currentTarget.textContent)),
				});
				enhanceInputs(pointspoolElement);
				this.element.querySelector(`[data-id="${poolingUnit.id}"]`).appendChild(pointspoolElement);
			}
		}
	}
}

owc.editor.registerLayout(ArmylistLayout);
