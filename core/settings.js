/**
 * Settings for the look and behaviour of the OWC and management methods for them.
 */
class OwcSettings
{
	/** Key that is used in the localStorage for storing the settings. */
	static STORAGE_KEY = "owc_settings";

	/** Default setting values. */
	static DEFAULTS = Object.freeze(/** @type {OwcSettings.KeyMap} */({
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
	}));

	/**
	 * Stores the current values of all settings.
	 */
	#properties = { ...OwcSettings.DEFAULTS };

	/**
	 * Internal flag to prevent the triggering of `setProperty()` and application of values ​​during loading.
	 */
	#isLoading = true;

	/**
	 * Listeners for changes of setting values.
	 * @type {Map<keyof OwcSettings.KeyMap,Array<(val: any)=>void>>}
	 */
	#listenersOnChange = new Map();

	/**
	 */
	constructor()
	{
		// In case that the settings were modified in another tab, refresh this tab when the user returns here.
		document.addEventListener("visibilitychange", () =>
		{
			if (document.visibilityState === "visible")
			{
				this.load();
			}
		});
	}

	/**
	 * Provides all settings properties with their values.
	 */
	getAllProperties ()
	{
		return { ...this.#properties };
	}

	/**
	 * Sets a settings properties value. This may trigger a reload of data or re-rendering of the editor.
	 * @param {keyof OwcSettings.KeyMap} name Name of the settings property to set.
	 * @param {any} value The new value of the settings property.
	 */
	setProperty (name, value)
	{
		if (!Object.keys(OwcSettings.DEFAULTS).includes(name))
		{
			throw new ReferenceError(`Unknown property "${name}".`);
		}
		else if (typeof value !== typeof this.#properties[name])
		{
			throw new TypeError(`Bad type for property "${name}": ${typeof value}. Expected ${typeof this.#properties[name]}.`);
		}
		else
		{
			/** @type {Record<keyof OwcSettings.KeyMap, AnyPrimitive>} */(this.#properties)[name] = value;
			if (!this.#isLoading)
			{
				localStorage?.setItem(OwcSettings.STORAGE_KEY, JSON.stringify(this.#properties));
			}
			for (const changeListener of this.#listenersOnChange.get(name) ?? [])
			{
				changeListener(value);
			}
		}
	}

	/**
	 * @returns Indicator if settings are still loading, to prevent operations while more {@linkcode onChange} events may be called.
	 */
	get isLoading ()
	{
		return this.#isLoading;
	};

	/**
	 * @returns A list of all selected rule books (abbreviations only).
	 */
	get ruleScope ()
	{
		return Object.freeze([
			"sbh",
			this.#properties["rulebook.sam.enabled"] && "sam",
			this.#properties["rulebook.sdg.enabled"] && "sdg",
			this.#properties["rulebook.sgd.enabled"] && "sgd",
			this.#properties["rulebook.sww.enabled"] && "sww",
		].filter(Boolean));
	}

	/**
	 * @returns The quality and combat values set as default for new units.
	 */
	get defaults ()
	{
		return Object.freeze(/** @type {Unit.Defaults}*/({
			quality: this.#properties["defaults.quality"],
			combat: this.#properties["defaults.combat"],
		}));
	}

	/**
	 * @returns Various settings options for rendering the warband.
	 */
	get options ()
	{
		return Object.freeze(/** @type {OwcEditor.Options} */({
			countFigures: this.#properties["editor.countFigures"],
			personalitiesInPoints: this.#properties["editor.personalitiesInPoints"],
			applyRuleChecks: this.#properties["editor.applyRuleChecks"],
			highlightPersonalities: this.#properties["editor.highlightPersonalities"],
		}));
	};

	/**
	 * @returns The name of the current editor layout.
	 */
	get editorLayout ()
	{
		return this.#properties["editor.layout"];
	}

	/**
	 * @returns The current localization language.
	 */
	get language ()
	{
		return this.#properties["editor.language"];
	}

	/**
	 * Loads settings from the browser's `localStorage`.
	 */
	load ()
	{
		this.#isLoading = true;
		try
		{
			/** @type {Partial<OwcSettings.KeyMap>} */
			const storedSettings = JSON.parse(localStorage?.getItem(OwcSettings.STORAGE_KEY) ?? "{}");
			for (const [key, value] of /** @type {Array<[keyof OwcSettings.KeyMap, AnyPrimitive]>} */(Object.entries(OwcSettings.DEFAULTS)))
			{
				this.setProperty(key, storedSettings[key] ?? value);
			}
		}
		finally
		{
			this.#isLoading = false;
		}
	}

	/**
	 * Registers a listener to changes of a specific setting.
	 * @template {keyof OwcSettings.KeyMap} T
	 * @param {T} setting Setting to monitor.
	 * @param {(val: OwcSettings.KeyMap[T]) => void} callback Callback to call on setting a value to this setting.
	 */
	onChange (setting, callback)
	{
		this.#listenersOnChange.has(setting) || this.#listenersOnChange.set(setting, []);
		this.#listenersOnChange.get(setting).push(callback);
	}
}
