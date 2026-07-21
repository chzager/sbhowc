/**
 * Layout for classic unit profiles (as seen in the rule books) with inputs for desktop devices.
 */
class ClassicLayout extends OwcDesktopLayout
{
	/** @type {"classic"} No more abstract. */
	static id = "classic";

	/**
	 * The "unit count print element" is a print-only `<div>` element in the layout. Whenever the value
	 * of the unit count `<input>` element changes, this function updates the content of this hidden
	 * print-only element.
	 * @param {Unit} unit Affected unit.
	 */
	#updateUnitCountPrintElement (unit)
	{
		const countPrinterElement = this.element.querySelector(`[data-id="${unit.id}"] [name="count-printer"]`);
		countPrinterElement.textContent = `x${unit.count}`;
		countPrinterElement.style.display = (unit.count > 1) ? "initial" : "none";
	}

	/** @override */
	get snippetData ()
	{
		return Object.assign(super.snippetData,
			{
				onUnitCountChanged: (/** @type {UIEvent<HTMLInputElement>} */ev) =>
				{
					super.snippetData.onUnitCountChanged(ev);
					this.#updateUnitCountPrintElement(this.getEventUnit(ev));
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
	}
}

owc.editor.registerLayout(ClassicLayout);
