// @ts-check
/**
 * Settings for the look and behaviour of the OWC and management methods for them.
 */
class OwcSettings
{
	/** Key that is used in the localStorage for storing the settings. */
	static STORAGE_KEY = "owc_settings";

	/** Default setting values. */
	static DEFAULTS = Object.freeze({
		"rulebook.sam.enabled": false,
		"rulebook.sdg.enabled": false,
		"rulebook.sgd.enabled": true,
		"rulebook.sww.enabled": true,
		"defaults.quality": 3,
		"defaults.combat": 3,
		"editor.language": "en",
		"editor.layout": ("ontouchstart" in window) ? "classic-touch" : "classic",
		"editor.countFigures": true,
		"editor.personalitiesInPoints": true,
		"editor.applyRuleChecks": true,
		"editor.highlightPersonalities": true,
		"print.warbandCode": false,
		"print.warnings": true,
	});

	/**
	 * Internal storage of the current values.
	 * @type {typeof OwcSettings.DEFAULTS}
	 */
	#properties = Object.assign({}, OwcSettings.DEFAULTS);

	/**
	 * Internal flag to prevent the triggering of `setProperty()` and application of values ​​during loading.
	 */
	#isLoading = true;


	/**
	 * Provides all settings properties with their values.
	 */
	getAllProperties ()
	{
		return { ...this.#properties };
	}

	/**
	 * Sets a settings properties value. This may trigger a reload of data or re-rendering of the editor.
	 * @param {keyof typeof OwcSettings.DEFAULTS} name Name of the settings property to set.
	 * @param {any} value The new value of the settings property.
	 */
	setProperty (name, value)
	{
		if (typeof value !== typeof this.#properties[name])
		{
			console.error(`Bad type for property "${name}": ${typeof value}. Expected ${typeof this.#properties[name]}.`);
		}
		else if (!Object.keys(OwcSettings.DEFAULTS).includes(name))
		{
			console.error(`Unknown property "${name}".`);
		}
		else
		{
			// @ts-ignore - IntelliSense falsely assumes that `this.#properties` is read-only.
			this.#properties[name] = value;
			this.save();
			switch (name)
			{
				case "rulebook.sam.enabled":
				case "rulebook.sdg.enabled":
				case "rulebook.sgd.enabled":
				case "rulebook.sww.enabled":
					if (!this.#isLoading)
					{
						owc.localizer.import(...this.ruleScope).then(() => owc.editor.render());
					}
					break;
				case "defaults.quality":
					owc.warband.unitDefaults.quality = this.#properties["defaults.quality"];
					break;
				case "defaults.combat":
					owc.warband.unitDefaults.combat = this.#properties["defaults.combat"];
					break;
				case "editor.layout":
					if (!this.#isLoading)
					{
						owc.editor.layout = value;
					}
					break;
				case "editor.language":
					owc.localizer.targetLanguage = this.#properties["editor.language"];
					break;
				case "editor.countFigures":
				case "editor.personalitiesInPoints":
				case "editor.applyRuleChecks":
				case "editor.highlightPersonalities":
					if (!this.#isLoading)
					{
						owc.editor.render();
					}
					break;
				case "print.warbandCode":
					document.getElementById("warband-print-code").style.display = (value) ? "initial" : "none";
					break;
				case "print.warnings":
					document.getElementById("warband-warnings").classList.toggle("screen-only", !value);
					break;
			}
		}
	}

	/**
	 * @returns {Array<string>} A list of all selected rule books (abbreviations only).
	 */
	get ruleScope ()
	{
		// @ts-ignore - IntelliSense doesn't recognize that there are no falsy values in the result array.
		return [
			"sbh",
			this.#properties["rulebook.sam.enabled"] && "sam",
			this.#properties["rulebook.sdg.enabled"] && "sdg",
			this.#properties["rulebook.sgd.enabled"] && "sgd",
			this.#properties["rulebook.sww.enabled"] && "sww",
		].filter(Boolean);
	}

	/**
	 * @returns The quality and combat values set as default for new units.
	 */
	get defaults ()
	{
		return {
			quality: this.#properties["defaults.quality"],
			combat: this.#properties["defaults.combat"],
		};
	}

	/**
	 * @returns {OwcSettingsOptions} Various settings options for rendering the warband.
	 */
	get options ()
	{
		return {
			countFigures: this.#properties["editor.countFigures"],
			personalitiesInPoints: this.#properties["editor.personalitiesInPoints"],
			applyRuleChecks: this.#properties["editor.applyRuleChecks"],
			highlightPersonalities: this.#properties["editor.highlightPersonalities"],
		};
	};

	/**
	 * @returns {string} The name of the current editor layout.
	 */
	get editorLayout ()
	{
		return owc.editor.layout;
	}

	/**
	 * @returns {string} The current localization language.
	 */
	get language ()
	{
		return owc.localizer.targetLanguage;
	}

	/**
	 * Saves all settings to the browser's `localStorage`.
	 */
	save ()
	{
		if (!this.#isLoading)
		{
			const data = {};
			for (const key of Object.keys(OwcSettings.DEFAULTS))
			{
				data[key] = this.#properties[key];
			}
			localStorage?.setItem(OwcSettings.STORAGE_KEY, JSON.stringify(data));
		}
	}

	/**
	 * Loads settings from the browser's `localStorage`.
	 */
	load ()
	{
		this.#isLoading = true;
		let storedSettings = {};
		try
		{
			storedSettings = JSON.parse(localStorage?.getItem(OwcSettings.STORAGE_KEY));
			if (storedSettings)
			{
				for (const [key, value] of Object.entries(OwcSettings.DEFAULTS))
				{
					// @ts-ignore - `string` is not compatible with `keyof typeof OwcSettings.properties` can be ignored because `setProperty()` checks the name.
					this.setProperty(key, storedSettings[key] ?? value);
				}
			}
		}
		finally
		{
		}
		owc.localizer.import(...this.ruleScope).then(() => owc.editor.layout = this.#properties["editor.layout"]); // This finally renders the editor.
		this.#isLoading = false;
	}
}
