// @ts-check
/**
 * A modal dialog for selecting an editing specialrules of an unit.
 */
class SpecialrulesSelector
{
	/**
	 * The currently active instance. @type {SpecialrulesSelector}
	 */
	static activeInstance = null;

	/**
	 * This dialog's element on the DOM.
	 * @type {HTMLElement}
	 */
	#element;

	/**
	 * The currently edited unit.
	 * @type {Unit}
	 */
	#unit = null;

	/**
	 * The currently edited unit before edit. That's to be compared to the unit's current state to determine if any actual changes were made.
	 * @type {Unit}
	 */
	#unitBefore = null;

	/**
	 * The warband code before edition for the undo snapshot.
	 */
	#warbandCodeBefore = "";

	/**
	 * Position of the undo snapshot before edition.
	 */
	#snapshotPositionBefore = 0;

	/**
	 * @param {OwcEditor} editor The current editor.
	 */
	constructor(editor)
	{
		/** The {@linkcode OwcEditor} using this modal dialog. */
		this.editor = editor;
		/** Provider of localization functionality. */
		this.localizer = editor.localizer;
		/** The directory that contains specialrules. */
		this.specialrulesDirectory = editor.warband.specialrulesDirectory;
	}

	/**
	 * Pops up the specialrules modal dialog at a position relative to the event for the given unit.
	 * @param {PointerEvent} event The triggering event.
	 * @param {Unit} unit The unit to be edited.
	 */
	popup (event, unit)
	{
		const mapSpecialrule = (/** @type {OwcSpecialruleDirectoryEntry|OwcSpecialruleInstance} */srl) =>
		{
			const specialruleLocaleText = (this.localizer.has(srl.key)) ? this.localizer.translate(srl.key) : this.specialrulesDirectory.get(srl.key).label;
			const r = {
				key: srl.key,
				points: srl.points,
				pointsSign: Math.sign(srl.points),
				isPersonality: this.specialrulesDirectory.get(srl.key).personality ?? false,
				textBefore: specialruleLocaleText,
				displayText: specialruleLocaleText,
			};
			if (specialruleLocaleText.includes("..."))
			{
				const [textBefore, textAfter] = specialruleLocaleText.split("...");
				const additionalText = (("additionalText" in srl) ? srl.additionalText : "") || "...";
				r.displayText = [textBefore, additionalText, textAfter].join("\u0020").replaceAll(/\s{2,}/g, " ").trim();
				r.textBefore = textBefore;
				r.additionalText = additionalText;
				r.textAfter = textAfter;
			}
			return r;
		};
		SpecialrulesSelector.activeInstance?.close();
		this.#unit = unit;
		this.#unitBefore = unit.clone();
		this.#warbandCodeBefore = unit.warband.toString();
		this.#snapshotPositionBefore = this.editor.snapshots.length;
		const specialrules = Array.from(this.specialrulesDirectory.values());
		const unitDisplayName = this.localizer.nonBlankUnitName(unit.name);
		const snippetData = {
			title: this.localizer.translate("specialrulesOfUnit", { UNIT: (unitDisplayName.length > 30) ? unitDisplayName.substring(0, 30) + "\u2026" : unitDisplayName }),
			selectedSpecialrules: unit.specialrules
				.map(mapSpecialrule),
			availableSpecialrules: specialrules
				.filter(s => !unit.specialrules.some(z => (z.key === s.key)))
				.map(mapSpecialrule)
				.sort((a, b) => a.displayText.localeCompare(b.displayText)),

			/** @type {ElementEventHandler} */
			additionalTextClicked: (evt) =>
			{
				evt.stopImmediatePropagation();
				/** @type {HTMLElement} */
				const checkItem = evt.currentTarget.closest("[data-checked]");
				checkItem.dataset.checked = "true";
				this.#unit.addSpecialrule(checkItem.dataset.key);
			},

			/** @type {ElementEventHandler} */
			setAdditionalText: (evt) =>
			{
				const key = /** @type {HTMLElement} */(evt.currentTarget.closest("[data-key]")).dataset.key;
				this.editor.setUnitSpecialruleAdditionalText(unit, key, evt.currentTarget.textContent);
			},

			/** @type {ElementEventHandler<HTMLSelectElement>} */
			toggleSpecialrule: (evt) =>
			{
				const key = evt.currentTarget.dataset.key;
				const isCheckedNow = !(evt.currentTarget.dataset.checked === "true");
				if (isCheckedNow)
				{
					this.editor.addUnitSpecialrule(unit, key);
				}
				else
				{
					this.editor.removeUnitSpecialrule(unit, key);
				}
				evt.currentTarget.dataset.checked = (isCheckedNow).toString();
			},

			okClicked: () => this.close(),
		};
		this.#element = /** @type {HTMLElement} */(pageSnippets.produce("/components/specialrulesSelector/main", snippetData));
		enhanceInputs(this.#element);
		// @ts-ignore - We don't have a defintion file for `Sortable`.
		new Sortable(this.#element.querySelector("[data-sortable]"), {
			draggable: ".item",
			handle: ".sort", // handle's class
			chosenClass: "sortable-specialrules-chosen",
			animation: 150,
		});
		document.body.appendChild(this.#element);
		const elementRect = this.#element.getBoundingClientRect();
		const position = new DOMPoint(
			Math.min(Math.max(event.clientX - (elementRect.width / 2), 0), visualViewport.width - elementRect.width),
			Math.min(Math.max(event.clientY - (elementRect.height / 2), window.scrollY), visualViewport.height - elementRect.height)
		);
		this.#element.style.left = `${position.x}px`;
		this.#element.style.top = `${position.y}px`;
		SpecialrulesSelector.activeInstance = this;
	}

	/**
	 * Closes the specialule selection dialog. Applies all changes to the unit and creates an undo snapshot.
	 * Discards the DOM element afterwards.
	 */
	close ()
	{
		this.editor.snapshots.splice(0, this.editor.snapshots.length - this.#snapshotPositionBefore);
		const specialrulesCopy = [...this.#unit.specialrules];
		this.#unit.specialrules = [];
		for (const selectedElement of /** @type {NodeListOf<HTMLElement>} */(this.#element.querySelectorAll("[data-checked='true']")))
		{
			const specialrule = this.specialrulesDirectory.get(selectedElement.dataset.key);
			this.#unit.addSpecialrule(specialrule.key);
			if (specialrule.needsSpecification)
			{
				this.#unit.specialrules.find(s => (s.key === specialrule.key)).additionalText = specialrulesCopy.find(s => (s.key === specialrule.key)).additionalText;
			}
		}
		if (this.#unitBefore.toString() !== this.#unit.toString())
		{
			this.editor.snapshots.unshift({
				label: `Edit special rules of ${this.localizer.nonBlankUnitName(this.#unit.name)}`,
				pointsModification: this.#unit.points - this.#unitBefore.points,
				warbandCode: this.#warbandCodeBefore
			});
			this.editor.storeWarbandInBrowser();
			this.editor.render();
		}
		SpecialrulesSelector.activeInstance = null;
		this.#element?.remove();
	}
}

// Listen on clicks on the document. If clicked outside an active specialtules selection dialog, cancel that dialog.
document.addEventListener("click", (evt) =>
{
	if ((evt.target instanceof HTMLElement) && !evt.target.closest(".specialruletrigger") && !evt.target.closest("#specialrulesSelector"))
	{
		SpecialrulesSelector.activeInstance?.close();
	}
});
