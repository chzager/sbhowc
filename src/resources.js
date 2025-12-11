// @ts-check
/**
 * Directory of text resources in available languages and localization methods.
 * @augments Map<string,{[lang:string]:string}>
 */
class OwcLocalizer extends Map
{
	/** The default/initial language. */
	static DEFAULT_LANGUAGE = "en";

	/** Target language in which to provide text resources. */
	#targetLanguage = OwcLocalizer.DEFAULT_LANGUAGE;

	/**
	 * List of all loaded resource files.
	 * @type {Set<string>}
	 */
	loadedUrls = new Set();

	/**
	 * Target language in which to provide text resources. On change, all currently loaded resource files will
	 * be loaded for the new language (if available) and the warband editor will automatically re-render with
	 * the new locales.
	 */
	get targetLanguage ()
	{
		return this.#targetLanguage;
	}
	set targetLanguage (val)
	{
		this.#targetLanguage = val;
		this.import(...Array.from(this.loadedUrls).map(u => /(\w+)\.json$/.exec(u)[1]))
			.finally(() => owc.editor.render());
	}

	/**
	 * Loads localization data from a resources file.
	 * @param {Array<string>} resourceKey The simple key of the local resource to fetch. This is without path or file extension.
	 * @returns A promise that resolves when all resources were loaded.
	 */
	import (...resourceKey)
	{
		/** @type {Array<Promise>} */
		const asyncs = [];
		for (const k of resourceKey)
		{
			const url = `locales/${this.#targetLanguage}/${k}.json`;
			if (!this.loadedUrls.has(url))
			{
				asyncs.push(fetchEx(url)
					.then(/** @type {Object<string,string>} */locales =>
					{
						for (const [key, text] of Object.entries(locales))
						{
							super.has(key) || super.set(key, {});
							super.get(key)[this.#targetLanguage] = text;
						}
						this.loadedUrls.add(url);
					}));
			}
		}
		return Promise.allSettled(asyncs);
	}

	/**
	 * Translates a text resource to the {@linkcode targetLanguage}.
	 * @param {string} resourceId Id of the resource to be translated.
	 * @param {{ [key: string]: string | number }} [placeholders] If the text contains placeholders (in curled brackets, e.g. `{UNIT}`), this gives the values for the placeholders.
	 * @returns The text in the target language with all placeholders replaced by actual values.
	 */
	translate (resourceId, placeholders = {})
	{
		const resource = super.get(resourceId);
		{
			if (resource)
			{
				const text = resource[this.#targetLanguage] || resource[OwcLocalizer.DEFAULT_LANGUAGE];
				return stringFill(text, placeholders);
			}
			else
			{
				console.warn(`No such resource "${resourceId}".`);
				return "<" + resourceId + "?>";
			}
		}
	}

	/**
	 * Returns either the actual name of a warband, or if it's blank the localized default warband name.
	 * @param {string} [warbandName] The warband name.
	 */
	nonBlankWarbandName (warbandName)
	{
		return warbandName || this.translate("defaultWarbandName");
	}

	/**
	 * Returns either the actual name of an unit, or if it's blank the localized default unit name.
	 * @param {string} [unitName] The unit name.
	 */
	nonBlankUnitName (unitName)
	{
		return unitName || this.translate("defaultUnitName");
	}
}

/**
 * A directory of special rule definitions.
 * @augments Map<string,OwcSpecialruleDirectoryEntry>
 */
class OwcSpecialrulesDirectory extends Map
{
	/**
	 * Loads all specialrule definition files.
	 *
	 * Note: Since this method loads ALL specialrules, it must be called only once.
	 * @returns A promise that resolves when all files have been loaded.
	 */
	async load ()
	{
		if (this.size > 0)
		{
			throw new Error("Already loaded.");
		}
		/** @type {Array<Promise>} */
		const asyncs = [];
		for (const rulebookAbbr of ["sbh", "sgd", "sww", "sdg", "sam"])
		{
			asyncs.push(fetchEx(`rulebooks/${rulebookAbbr}.json`)
				.then((/** @type {OwcRulebookJson} */rulebook) =>
				{
					// Append data from imported rulebook:
					for (const [key, data] of Object.entries(rulebook.data))
					{
						if (!super.has(key))
						{
							super.set(key, Object.assign({ key: key, rulebook: rulebook.id }, data));
						}
						else
						{
							throw new Error(`Duplicate resource identifier "${key}" in ${super.get(key).rulebook.toUpperCase()} and ${rulebook.id.toUpperCase()}.`);
						}
						// Make sure at least the label is avaliable as locale text:
						(owc.localizer.has(key)) || owc.localizer.set(key, { [OwcLocalizer.DEFAULT_LANGUAGE]: data.label });
					}
				}));
		}
		await Promise.allSettled(asyncs);
		for (const specialrule of super.values())
		{
			// Manage recursive references:
			for (const property of ["replaces", "variants"])
			{
				const propertyKeys = specialrule[property] ?? [];
				for (const propertyKey of propertyKeys)
				{
					const otherSpecialrules = (super.get(propertyKey)[property] ??= []);
					for (const otherKey of [specialrule.key, ...propertyKeys])
					{
						!otherSpecialrules.includes(otherKey) && (propertyKey !== otherKey) && otherSpecialrules.push(otherKey);
					}
				}
			}
			// Add variants to excludes:
			for (const excludeKey of specialrule.excludes ?? [])
			{
				for (const variantKey of super.get(excludeKey).variants ?? [])
				{
					specialrule.excludes.includes(variantKey) || specialrule.excludes.push(variantKey);
				}
			}
		}
	}
}
