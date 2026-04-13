/**
 * An item in the {@linkcode SpecialrulesSelector}.
 */
interface SpecialrulesSelectorItem {
	/** Identifier of the special rule. */
	key: string;
	/** The point costs of that special rule. */
	points: number;
	/** This is either `1` for positive point costs, `-1` for negative point costs or `0` for zero-points special rules. */
	pointsSign: number;
	/** Flag that this special rule makes an unit a personality. */
	isPersonality: boolean;
	/** The localized special rule name. For specifiable special rules, this is the text before the specification. */
	text: specialruleLocaleText,
	/** For specifiable speicalrules only, this is the specification. */
	specificationText?: string;
	/** For specifiable speicalrules only, this is the specialule text that come after the specification. */
	textAfter?: string;
}
