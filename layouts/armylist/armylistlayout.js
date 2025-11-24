// @ts-check
/**
 * Layout for unit profiles as a single table; with inputs for desktop devices.
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
	}
}

owc.editor.registerLayout(ArmylistLayout);
