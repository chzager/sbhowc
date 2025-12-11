// @ts-check
/**
 * Basic class for the warband editor and unit profile layouts.
 * @abstract
 */
class OwcLayout
{
	/** Unique identifier of this layout. As key for the {@linkcode OwcEditor}'s layouts directory. */
	static id = null;

	/**
	 * @param {OwcEditor} editor The current editor using this layout.
	 * @param {OwcLocalizer} localizer Provider of localization functionality.
	 */
	constructor(editor, localizer)
	{
		// @ts-ignore - "Property 'id' does not exist on type 'Function'" -> We know it does exist here.
		const thisId = /** @type {string} */(this.constructor.id);
		if (this.constructor === OwcLayout)
		{
			throw new TypeError("Illegal constructor: OwcLayout is an abstract class.");
		}
		else if (!thisId)
		{
			throw new TypeError(`${this.constructor.name} must have a static id poperty.`);
		}
		/** The unique identifier of this layout. */
		this.name = thisId;
		/** The {@linkcode OwcEditor} using this layout. */
		this.editor = editor;
		/** The warband that is currently beeing edited. This is a shortcut to `this.editor.warband`. */
		this.warband = editor.warband;
		/** Provider of localization functionality. */
		this.localizer = localizer;
		/** The HTML element that represents this layout on the document. @type {HTMLElement} */
		this.element; // Will be created in this `render()` method.
	}

	/**
	 * @returns {PageSnippetsProductionData} The individual layout's data to be passed to the page snippet on production. This extends the generic editor's page snippet data.
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
		/** Most common used texts in unit profiles. @type {{[k: string]: string}} */
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
					const clipboardUnit = new Unit(this.warband).fromString(this.editor.clipboard.getData()?.data);
					ele.appendChild(makeElement(
						"button",
						this.localizer.translate("pasteUnit", { UNIT: this.localizer.nonBlankUnitName(clipboardUnit.name) }),
						{ onclick: () => this.editor.addUnit(clipboardUnit) }
					));
				}
				catch {}
			}
		};
		for (const [name, value] of Object.entries(this.snippetData))
		{
			if (typeof value === "function")
			{
				snippetData[name] = (...args) => value(...args);
			}
			else
			{
				snippetData[name] = value;
			}
		}
		this.element = /** @type {HTMLElement} */(pageSnippets.produce(`layouts/${this.name}/main`, snippetData));
		this.element.id = this.name + "-layout";
		this.element.dataset.highlightPersonalities = this.editor.settings.options.highlightPersonalities.toString();
		this.editor.updateWarbandSummary();
		document.getElementById("editor-layout").replaceChildren(this.element);
	}

	/**
	 * Returns the warband's unit that is referenced on an event.
	 *
	 * This happens by finding the closests element having a `[data-id]` attribute which is assumed to provide the unit's id.
	 * @param {UIEvent} event Triggering event for which to get the assigned unit.
	 */
	getEventUnit (event)
	{
		if (event.currentTarget instanceof HTMLElement)
		{
			const id = /** @type {HTMLElement} */(event.currentTarget.closest("[data-id]")).dataset.id;
			return this.warband.units.find(u => (u.id === id));
		}
	}

	/**
	 * Updates the element that prints the unit's points on the document. This it to not having to re-render the entire editor
	 * on minor changes (but it also updates the warband summary).
	 *
	 * The respective element is found by having a `[name="points"]` attribute.
	 * @param {Unit} unit The affected unit.
	 */
	updateUnitPoints (unit)
	{
		this.element.querySelector(`[data-id="${unit.id}"] [name="points"]`).textContent = unit.points.toString();
		this.editor.updateWarbandSummary();
	}
}

/**
 * Basic class for layouts for desktop devices with physical input devices.
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

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			onWarbandNameBlur: (evt) => this.editor.setWarbandName(evt.currentTarget.textContent),

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			onUnitNameBlur: (evt) => this.editor.setUnitName(this.getEventUnit(evt), evt.currentTarget.textContent),

			/** @type {ElementEventHandler<HTMLInputElement, UIEvent>} */
			onUnitCountChanged: (evt) => this.editor.setUnitCount(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/** @type {ElementEventHandler<HTMLSelectElement, UIEvent>} */
			onQualityChanged: (evt) => this.editor.setUnitQuality(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/** @type {ElementEventHandler<HTMLSelectElement, UIEvent>} */
			onCombatChanged: (evt) => this.editor.setUnitCombat(this.getEventUnit(evt), Number(evt.currentTarget.value)),

			/** @type {ElementEventHandler<HTMLSelectElement, UIEvent>} */
			addSepecialRule: (evt) =>
			{
				this.editor.addUnitSpecialrule(this.getEventUnit(evt), evt.currentTarget.value);
				if (evt.currentTarget)
				{
					evt.currentTarget.selectedIndex = 0;
				}
			},

			/** @type {ElementEventHandler<HTMLElement, UIEvent>} */
			setPoolPoints: (evt) => this.editor.setPointsPool(evt.currentTarget.dataset.key, Number(evt.currentTarget.textContent)),
		};
	};

	/** @inheritdoc */
	render ()
	{
		super.render();
		inputHelper.attach(this.element);
	}

	/**
	 * Handles clicks on a "specialrule deletehelper". Calls the editor for removal of the affected specialrule from its unit.
	 * @param {UIEvent} event Triggering event.
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
	 * Handles changes of a specifiable specialrules's additional text. Calls the editor for updating the affected specialrule's additional text in its unit.
	 * @param {FocusEvent} event Triggering event.
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
