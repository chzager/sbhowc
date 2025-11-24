// @ts-check
// DOC entire file
/**
 */
class OwcSettings
{
	static STORAGE_KEY = "owc_settings";

	static DEFAULTS = Object.freeze({
		"rulebook.sam.enabled": false,
		"rulebook.sdg.enabled": false,
		"rulebook.sgd.enabled": true,
		"rulebook.sww.enabled": true,
		"defaults.quality": 3,
		"defaults.combat": 3,
		"editor.language": "en",
		"editor.layout": "classic",
		"editor.countFigures": true,
		"editor.personalitiesInPoints": true,
		"editor.applyRuleChecks": true,
		"editor.highlightPersonalities": true,
		"print.warbandCode": false,
		"print.warnings": true,
	});

	/** @type {typeof OwcSettings.DEFAULTS} */
	#properties = Object.assign({}, OwcSettings.DEFAULTS);

	#isLoading = true;

	/**
	 *
	 * @param {keyof typeof OwcSettings.DEFAULTS} name
	 */
	getProperty (name)
	{
		return this.#properties[name];
	}

	getAllProperties ()
	{
		return { ...this.#properties };
	}

	/**
	 *
	 * @param {keyof typeof OwcSettings.DEFAULTS} name
	 * @param {any} value
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

	/** @returns {Array<string>} */
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

	get defaults ()
	{
		return {
			quality: this.#properties["defaults.quality"],
			combat: this.#properties["defaults.combat"],
		};
	}

	/** @type {OwcSettingsOptions} */
	get options ()
	{
		return {
			countFigures: this.#properties["editor.countFigures"],
			personalitiesInPoints: this.#properties["editor.personalitiesInPoints"],
			applyRuleChecks: this.#properties["editor.applyRuleChecks"],
			highlightPersonalities: this.#properties["editor.highlightPersonalities"],
		};
	};

	/** @type {string} */
	get editorLayout ()
	{
		return owc.editor.layout;
	}

	/** @type {string} */
	get language ()
	{
		return owc.localizer.targetLanguage;
	}

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

	load ()
	{
		this.#isLoading = true;
		let storedSettings = {};
		try
		{
			storedSettings = JSON.parse(localStorage?.getItem(OwcSettings.STORAGE_KEY));
		}
		finally
		{
			for (const [key, value] of Object.entries(OwcSettings.DEFAULTS))
			{
				// @ts-ignore - `string` is not compatible with `keyof typeof OwcSettings.properties` can be ignored because `setProperty()` checks the name.
				this.setProperty(key, storedSettings[key] ?? value);
			}
		}
		owc.localizer.import(...this.ruleScope).then(() => owc.editor.layout = this.#properties["editor.layout"]); // This finally renders the editor.
		this.#isLoading = false;
	}
}
