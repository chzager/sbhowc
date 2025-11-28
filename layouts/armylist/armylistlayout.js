// @ts-check
/**
 * Unusual table-like layout; with inputs for desktop devices.
 */
class ArmylistLayout extends OwcDesktopLayout
{
	/** @inheritdoc */
	static id = "armylist";

	/**
	 * // DOC
	 * @param {Unit} unit
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
		const result = super.snippetData;
		result.onUnitCountChanged = (evt) =>
		{
			super.snippetData.onUnitCountChanged(evt);
			this.#updateUnitCountPrintElement(this.getEventUnit(evt));
		};
		return result;
	}

	/** @inheritdoc */
	render ()
	{
		super.render();
		for (const unit of this.warband.units)
		{
			this.#updateUnitCountPrintElement(unit);
		}
		// Attach every points pool to the first unit triggering that points pool.
		for (const [pointspoolKey, pointspoolValue] of this.warband.pointsPools)
		{
			const poolingUnit = this.warband.units.find(u => u.specialrules.some(s => (s.key === pointspoolKey)));
			{
				const pointspoolElement = /** @type {HTMLElement} */(pageSnippets.produce("/layouts/armylist/pointspool", {
					key: pointspoolKey,
					label: this.localizer.translate(pointspoolKey + "PointsPool"),
					points: pointspoolValue,
					/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
					setPoolPoints: (evt) => this.editor.setPointsPool(evt.currentTarget.dataset.key, Number(evt.currentTarget.textContent)),
				}));
				attachInputHelper(pointspoolElement);
				this.element.querySelector(`[data-id="${poolingUnit.id}"]`).appendChild(pointspoolElement);
			}
		}
	}
}

owc.editor.registerLayout(ArmylistLayout);
