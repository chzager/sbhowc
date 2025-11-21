// @ts-check
// DOC entire file
const settingsBluebox = new class extends Bluebox
{
	/**
	 *
	 * @param {OwcSettings} settings
	 * @param {OwcEditor} editor
	 */
	show (settings, editor)
	{
		function isInputElement (ele)
		{
			return (ele instanceof HTMLInputElement) || (ele instanceof HTMLSelectElement);
		}
		this.settings = settings;
		super.open("/bluebox/settings", {
			qualityValues: editor.qualityValues,
			defaultQualityValue: settings.defaults.quality,
			combatValues: editor.combatValues,
			defaultCombatValue: settings.defaults.combat,
			setLayout: (/** @type {UIEvent} */evt) =>
			{
				if (evt.target instanceof HTMLInputElement)
				{
					settings.setProperty(
						"editor.layout",
						/** @type {HTMLElement} */(this.element.querySelector('input[data-layout]:checked')).dataset.layout
					);
				}
			},
			setProperty: (/** @type {UIEvent} */evt) =>
			{
				if (isInputElement(evt.currentTarget))
				{
					const name = evt.currentTarget.id;
					/** @type {string|number|boolean} */
					let value = evt.currentTarget.value;
					if (evt.currentTarget instanceof HTMLInputElement)
					{
						switch (evt.currentTarget.type)
						{
							case "number":
								value = Number(value);
								break;
							case "checkbox":
							case "radio":
								value = evt.currentTarget.checked;
								break;
						}
					}
					else if (evt.currentTarget instanceof HTMLSelectElement)
					{
						switch (evt.currentTarget.dataset.type)
						{
							case "number":
								value = Number(value);
								break;
						}
					}
					// @ts-ignore - `string` is not compatible with `keyof typeof OwcSettings.properties` can be ignored because `setProperty()` checks the name.
					settings.setProperty(name, value);
				}
			},
			apply: () =>
			{
				this.close();
			},
		});

		/** @type {HTMLInputElement} */(this.element.querySelector(`input[data-layout="${settings.editorLayout}"]`)).checked = true;
		for (const [name, value] of Object.entries(settings.getAllProperties()))
		{
			const ele = this.element.querySelector(`[id="${name}"]`);
			if (isInputElement(ele))
			{
				if ((ele.type === "checkbox") && (typeof value === "boolean"))
				{
					ele.checked = value;
				}
				else if (typeof value === "string")
				{
					ele.value = value;
				}
			}
		}
	}
};
