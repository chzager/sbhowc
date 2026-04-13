/**
 * An item in the {@linkcode SpecialrulesSelector}.
 */
interface SpecialrulesSelectorItem {
	/** Identifier of the specialrule. */
	key: string;
	/** The point costs of that specialrule. */
	points: number;
	/** This is either `1` for positive point costs, `-1` for negative point costs or `0` for zero-points special rules. */
	pointsSign: number;
	/** Flag that this specialrule makes an unit a personality. */
	isPersonality: boolean;
	/** The localized specialrule name. For specified specialrules, this is the text before the specification. */
	text: specialruleLocaleText,
	/** For specified speicalrules only, this is the specification. */
	specificationText?: string;
	/** For specified speicalrules only, this is the specialule text that come after the specification. */
	textAfter?: string;
}
