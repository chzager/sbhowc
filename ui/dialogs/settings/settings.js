/**
 * Bluebox for setting the various settings of the app.
 */
const settingsBluebox = new class extends Bluebox
{
	/**
	 * @override
	 * @param {OwcSettings} settings Actual settings object instance.
	 * @param {OwcEditor} editor The OWC editor.
	 */
	show (settings, editor)
	{
		function isInputElement (/** @type {any}*/ele)
		{
			return (ele instanceof HTMLInputElement) || (ele instanceof HTMLSelectElement);
		}
		this.settings = settings;
		super.render("/bluebox/settings", {
			qualityValues: editor.qualityValues,
			defaultQualityValue: settings.defaults.quality,
			combatValues: editor.combatValues,
			defaultCombatValue: settings.defaults.combat,
			setLayout: () =>
			{
				settings.setProperty(
					"editor.layout",
					this.element.querySelector("input[data-layout]:checked").dataset.layout
				);
			},
			setProperty: (/** @type {UIEvent} */ev) =>
			{
				if (isInputElement(ev.currentTarget))
				{
					const name = ev.currentTarget.id;
					const value = ev.currentTarget.value;
					/** @type {AnyPrimitive} */
					let typedValue = value;
					if (ev.currentTarget instanceof HTMLInputElement)
					{
						switch (ev.currentTarget.type)
						{
							case "number":
								typedValue = Number(value);
								break;
							case "checkbox":
							case "radio":
								typedValue = ev.currentTarget.checked;
								break;
						}
					}
					else if (ev.currentTarget instanceof HTMLSelectElement)
					{
						switch (ev.currentTarget.dataset.type)
						{
							case "number":
								typedValue = Number(value);
								break;
						}
					}
					// @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'keyof OwcSettingsRecord'. -> TS is right. `name` comes from the UI which can't be forced to use proper values. That's why `setProperty()` checks it.
					settings.setProperty(name, typedValue);
				}
			},
			apply: () =>
			{
				this.close();
			},
		});
		// Populate the UI controls with the current settings values.
		/** @type {HTMLInputElement} */(this.element.querySelector(`input[data-layout="${settings.editorLayout}"]`)).checked = true;
		for (const [name, value] of Object.entries(settings.getAllProperties()))
		{
			const el = this.element.querySelector(`[id="${name}"]`);
			if (isInputElement(el))
			{
				if (el.type === "checkbox")
				{
					el.checked = !!value;
				}
				else if (typeof value === "string")
				{
					el.value = value;
				}
			}
		}
	}
};
