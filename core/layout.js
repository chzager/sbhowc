/**
 * Abstract base class for layouts of unit profiles in the warband editor.
 * @abstract
 */
class OwcLayout
{
	/**
	 * Unique identifier of this layout, used as a key in the {@linkcode OwcEditor}'s layouts directory.
	 * @type {string}
	 * @abstract
	 */
	static id = "";

	/**
	 * @param {OwcEditor} editor The current editor using this layout.
	 * @param {OwcLocalizer} localizer Provider of localization functionality.
	 */
	constructor(editor, localizer)
	{
		// @ts-expect-error: "Property 'id' does not exist on type 'Function'" -> It actually exist here (see line 9).
		const thisId = /** @type {string} */(this.constructor.id);
		if (this.constructor === OwcLayout)
		{
			throw new TypeError("Illegal constructor: OwcLayout is an abstract class.");
		}
		else if (!(!!thisId)) // "!"=not + "!!"=falsy
		{
			throw new TypeError(`${this.constructor.name} must have a static id property.`);
		}
		/** The unique identifier of this layout. */
		this.name = thisId;
		/** The {@linkcode OwcEditor} using this layout. */
		this.editor = editor;
		/** The warband that is currently being edited. This is a shortcut to `this.editor.warband`. */
		this.warband = editor.warband;
		/** Provider of localization functionality. */
		this.localizer = localizer;
	}

	/**
	 * @returns {PageSnippetsProductionData} The layout-specific data passed to the page snippet during rendering. This extends the generic editor's page snippet data.
	 */
	get snippetData ()
	{
		return {};
	};

	/**
	 * Renders the current warband in this layout into the document.
	 */
	render ()
	{
		/** Most commonly used texts in unit profiles. @type {{[k: string]: string}} */
		const locales = {
			blankWarbandName: this.localizer.nonBlankWarbandName(),
			blankUnitName: this.localizer.nonBlankUnitName(),
		};
		for (const commonResource of ["quality", "combat", "specialrules", "points", "addUnit", "addSpecialrule", "editSpecialrules"])
		{
			locales[commonResource] = this.localizer.translate(commonResource);
		}
		/** @type {PageSnippetsProductionData} */
		const snippetData =
		{
			/** @type {PageSnippetsCallFunction} */
			getLocaleText: (elem, _data, id) => elem.append(this.localizer.translate(id)),
			locales: locales,
			qualitySelectOptions: this.editor.qualityValues,
			combatSelectOptions: this.editor.combatValues,
			specialrulesSelectOptions: this.editor.specialrulesList,
			warband: this.warband,
			pointpools: Array.from(this.warband.pointsPools.entries()).map(([key, points]) => ({
				key: key,
				label: this.localizer.translate(`${key}PointsPool`),
				points: points
			})),
			addUnit: () => this.editor.addUnit(),
			editSpecialrules: (/** @type {PointerEvent} */evt) => new SpecialrulesSelector(this.editor).popup(evt, this.getEventUnit(evt)),
			popupUnitMenu: (/** @type {PointerEvent} */evt) => (evt.currentTarget instanceof HTMLElement) && this.editor.unitMenu.popup(evt, this.getEventUnit(evt), evt.currentTarget),
			getPasteUnitButton: (/** @type {HTMLElement} */ele) =>
			{
				try
				{
					const clipboardData = this.editor.clipboard.getData()?.data;
					if (clipboardData)
					{
						const clipboardUnit = new Unit(this.warband).fromString(clipboardData);
						ele.appendChild(makeElement(
							"button",
							this.localizer.translate("pasteUnit", { UNIT: this.localizer.nonBlankUnitName(clipboardUnit.name) }),
							{ onclick: () => this.editor.addUnit(clipboardUnit) }
						));
					}
				}
				catch (cause)
				{ // If we can't read what's in the editor's clipboard, then that's just how it is. Maybe it's even empty.
					console.error(cause);
				}
			}
		};
		for (const [name, value] of Object.entries(this.snippetData))
		{
			if (typeof value === "function")
			{
				snippetData[name] = (/** @type {...any} */...args) => value(...args);
			}
			else
			{
				snippetData[name] = value;
			}
		}
		/** The HTML element that represents this layout on the document. */
		this.element = /** @type {HTMLElement} */(pageSnippets.produce(`/layouts/${this.name}/main`, snippetData));
		this.element.id = this.name + "-layout";
		this.element.dataset.highlightPersonalities = this.editor.settings.options.highlightPersonalities.toString();
		this.editor.updateWarbandSummary();
		document.getElementById("editor-layout").replaceChildren(this.element);
	}

	/**
	 * Returns the warband's unit referenced by an event. This is done by finding the closest element with a `[data-id]` attribute, which provides the unit's ID.
	 * @param {UIEvent} event The triggering event for which to retrieve the assigned unit.
	 */
	getEventUnit (event)
	{
		let unit;
		if (event.currentTarget instanceof HTMLElement)
		{
			const id = /** @type {HTMLElement} */(event.currentTarget.closest("[data-id]")).dataset.id;
			unit = this.warband.units.find(u => (u.id === id));
		}
		if (!unit)
		{
			throw new Error("No unit found that would be referenced by event.", { cause: event.currentTarget });
		}
		return unit;
	}

	/**
	 * Updates the element displaying the unit's points on the document. This avoids re-rendering the entire editor for minor changes (but also updates the warband summary).
	 *
	 * The corresponding element is found by its `[name="points"]` attribute.
	 * @param {Unit} unit The affected unit.
	 */
	updateUnitPoints (unit)
	{
		this.element.querySelector(`[data-id="${unit.id}"] [name="points"]`).textContent = unit.points.toString();
		this.editor.updateWarbandSummary();
	}
}

/**
 * Abstract base class for layouts for desktop devices with physical input devices.
 * @abstract
 */
class OwcDesktopLayout extends OwcLayout
{
	/**
	 * @param {OwcEditor} editor The current editor using this layout.
	 * @param {OwcLocalizer} localizer Provider of localization functionality.
	 */
	constructor(editor, localizer)
	{
		super(editor, localizer);
		if (this.constructor === OwcDesktopLayout)
		{
			throw new TypeError("Illegal constructor: OwcDesktopLayout is an abstract class.");
		}
	}

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
					element.replaceChildren(
						makeElement("span.specialrule-deletehelper", textBefore.trim(), "&#x0020;"),
						makeElement("span.specialrule-additionaltext.active.dyn-width", data.additionalText, {
							contenteditable: "true", // HTML attribute values are always strings.
							"data-blank": "...",
							onblur: (evt) => this.onSepcialruleTextChange(evt),
						}),
					);
					if (!!textAfter.trim())
					{
						element.appendChild(makeElement("span", "&#x0020;", textAfter.trim()));
					}
				}
				else
				{
					element.replaceChildren(makeElement("span.specialrule-deletehelper", specialruleLocaleText));
				}
				if (!this.editor.settings.ruleScope.includes(data.rulebook))
				{
					element.firstElementChild.classList.add("out-of-scope");
				}
				element.appendChild(makeElement("div.tooltip", [
					data.label,
					`${data.points} Pts`,
					data.rulebook.toUpperCase(),
					(data.isPersonality) && "personality"
				].filter(Boolean).join(", ")));
				/** @type {HTMLElement} */(element.querySelector(".specialrule-deletehelper")).onclick = (evt) => this.onSpecialruleDelete(evt);
			},

			/**
			 * Event handler for when the warband name input loses focus. Applies the input's value as the new warband name.
			 * @type {ElementEventHandler}
			 */
			onWarbandNameBlur: (evt) => this.editor.setWarbandName(evt.currentTarget.textContent),

			/**
			 * Event handler for when a unit's name input loses focus. Applies the input's value as the unit's new name.
			 * @type {ElementEventHandler}
			 */
			onUnitNameBlur: (evt) => this.editor.setUnitName(this.getEventUnit(evt), evt.currentTarget.textContent),

			/**
			 * Event handler for when a unit's count input loses focus. Applies the input's value as the unit's new count.
			 * @type {ElementEventHandler<HTMLInputElement>}
			 */
			onUnitCountChanged: (evt) => this.editor.setUnitCount(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/**
			 * Event handler for when a unit's quality value dropdown loses focus. Applies the dropdown's value as the unit's new quality value.
			 * @type {ElementEventHandler<HTMLSelectElement>}
			 */
			onQualityChanged: (evt) => this.editor.setUnitQuality(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/**
			 * Event handler for when a unit's combat value dropdown loses focus. Applies the dropdown's value as the unit's new combat value.
			 * @type {ElementEventHandler<HTMLSelectElement>}
			 */
			onCombatChanged: (evt) => this.editor.setUnitCombat(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/**
			 * Event handler for when a points pool input element loses focus. Applies the input's value as the new points for that pool.
			 * @type {ElementEventHandler}
			 */
			onPoolpointsBlur: (evt) => this.editor.setPointsPool(evt.currentTarget.dataset.key, Number(evt.currentTarget.textContent)),
		};
	};

	/** @inheritdoc */
	render ()
	{
		super.render();
		enhanceInputs(this.element);
	}

	/**
	 * Handles clicks on a "special rule delete helper". Calls the editor to remove the affected special rule from its unit.
	 * @param {UIEvent} event The triggering event.
	 */
	onSpecialruleDelete (event)
	{
		if (event.currentTarget instanceof HTMLElement)
		{
			this.editor.removeUnitSpecialrule(
				this.getEventUnit(event),
				/** @type {HTMLElement} */(event.currentTarget.closest("[data-key]")).dataset.key
			);
		}
	}

	/**
	 * Handles changes to a specifiable special rule's additional text. Calls the editor to update the affected special rule's additional text in its unit.
	 * @param {FocusEvent} event The triggering event.
	 */
	onSepcialruleTextChange (event)
	{
		if (event.currentTarget instanceof HTMLElement)
		{
			this.editor.setUnitSpecialruleAdditionalText(
				this.getEventUnit(event),
				/** @type {HTMLElement} */(event.currentTarget.closest("[data-key]")).dataset.key,
				event.currentTarget.textContent
			);
		}
	}
}
