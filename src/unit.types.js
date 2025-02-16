/**
 * @typedef SpecialrulePrototype
 * A basic specialrule property definition. This comes out ouf resources files.
 * @property {string} en The english (native) name of this specialrule.
 * Note that a `SpecialrulePrototype` may have names for other languages, loaded from additional resources.
 * These will add further object members named after the language key.
 * @property {number} points Points costs of this specialrule.
 * @property {string} scope Rulebook that introduces this specialrule (abbreviation).
 * @property {boolean} [personality] Whether this specialrule makes a unit a _personaliy_ (`true`) or not (`false`).
 * @property {Array<string>} [replaces] Ids of other specialrules that a replaced by this specialrule (e.g. "Shooter (long)" replaces "Shooter (medium)").
 * @property {Array<string>} [exclusive] Ids of other specialrules that are excluded for units having this specialrule.
 * In distinction to `excludes`, exclusive specialrules are multidirectional and exclusive to all each other,
 * e.g. "Elementalist", "Magic User", "Summoner" etc. are all exclusive to each other, meaning a unit can have only on of these.
 * @property {Array<string>} [excludes] Ids of other specialrules that are excluded for units having this specialrule.
 * In distinction to `exclusive`, excludes are unidirectional, e.g. "Coward" excludes "Fearless", "Hero" and "Steadfast",
 * but none of these three excludes any other.
 *
 * @typedef Specialrule
 * Special ability for a unit.
 * @property {string} key This specialrules id as reference to the specialrules resource.
 * @property {number} points Points costs of this specialrule.
 * @property {boolean} isPersonality Whether this specialrule makes the unit a _personaliy_ (`true`) or not (`false`).
 * @property {string} [additionalText] Additional text that specifies this specialrule it in more detail.
 *
 * @typedef SpecialrulesDictionary
 * A dictionary of specialrules. Keys are specialules ids.
 * @type {{[k: string]: SpecialrulePrototype}}
 *
 */
