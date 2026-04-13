// Generic basic type:
type ElementEventHandler<T extends HTMLElement = HTMLElement, E extends UIEvent = UIEvent> = (event: E & { currentTarget: T }) => any;
type AsyncElementEventHandler<T extends HTMLElement = HTMLElement, E extends UIEvent = UIEvent> = (event: E & { currentTarget: T }) => Promise<any>;
/** Any primitive type. */
type AnyPrimitive = string | number | boolean;

/** A special rule as it is assigned to an unit. */
interface OwcSpecialruleInstance {
	/** This special rule's id as a reference to the special rules resource. */
	key: string;
	/** Native label of the special rule. */
	label: string;
	/** Abbreviation of the rulebook where that special rule was introduced. */
	rulebook: string;
	/** Points costs of this special rule. */
	points: number;
	/** Whether this special rule makes the unit a _personality_ (`true`) or not (`false`). */
	isPersonality: boolean;
	/** Indicates that this special rule creates a separate pool point in the warband. */
	pooling?: boolean;
	/** For specifiable speicalrules, this is the specification text that specifies this special rule in more detail. */
	specificationText?: string;
}

/** Default values for new units. */
interface OwcUnitDefaults {
	/** Default quality value for units, from `2` (best) to `6` (worst), default: `3`. */
	quality: number;
	/** Default combat value for units, from `0` (worst) to `6` (best), default: `3`. */
	combat: number;
}

/** "Options" in the settings. */
interface OwcSettingsOptions {
	/** Display the count of figures in the warband summary? (Not implemented) */
	countFigures: boolean;
	/** Highlight personalities in the warband layout? */
	highlightPersonalities: boolean;
	/** `true` displays the value of personality figures in points. `false` displays the percentage of personality points. */
	personalitiesInPoints: boolean;
	/** Perform validation of the warband composition? */
	applyRuleChecks: boolean;
}

//#region special rules
/** Special rules file data structure. */
interface OwcRulebookJson {
	/** Rulebook (abbreviation) that introduces this special rules. */
	id: string;
	/** A list of special rule definitions. */
	data: {
		[key: string]: OwcRulebookJson_Specialrule;
	};
}
/** A single special rule in a specisl rules file. */
interface OwcRulebookJson_Specialrule {
	/** Label of this special rule. The actual display text comes from a locales file. */
	label: string;
	/** Points costs of this special rule. */
	points: number;
	/** Whether this special rule makes a unit a personality (true) or not (false). */
	personality?: boolean;
	/** Indicates that this special rule needs a specification at the unit. */
	needsSpecification?: boolean;
	/** Keys of other special rules that are replaced by this special rule (e.g. 'Shooter (long)' replaces 'Shooter (medium)'). */
	replaces?: Array<string>;
	/** Keys of other special rules that are variants of this special rule. */
	variants?: Array<string>;
	/** Keys of other special rules that are excluded for units having this special rule. */
	excludes?: Array<string>;
	/** Indicates that this special rule creates a separate pool point on the unit's warband. */
	pooling?: boolean;
}

/** An entry in the {@linkcode OwcSpecialrulesDirectory}. */
interface OwcSpecialruleDirectoryEntry extends OwcRulebookJson_Specialrule {
	key: string;
	rulebook: string;
}
//#endregion

/** A snapshot in the {@linkcode OwcEditor} undoer to rollback a modification in the warband. */
interface OwcUndoerSnapshot {
	/** Description of the modification. */
	label: string;
	/** The warband code BEFORE the modification. */
	warbandCode: string;
	/** Number by how many points the warband's costs were changed by this modification. */
	pointsModification: number;
}

/** Result data from an {@linkcode OwcValidationFunction}. */
interface OwcValidationResult {
	/** The locales resource key to put the rule violation into writing. */
	key: string;
	/** Placeholder values for the locales resource. */
	values?: { [x: string]: string | number }
}

/** Method type for performing specific validations of the warband. */
type OwcValidationFunction = () => OwcValidationResult | Array<OwcValidationResult> | undefined;

/** Data structure for warbands stored in the browser's `localStorage`. */
interface OwcLocalstorageData {
	/** The warband's name. */
	title: string;
	/** Count of figures in the warband. */
	figures: number;
	/** The warband's total points. */
	points: number;
	/** The warband code as string. */
	data: string;
	/** Date of when the warband was cached. */
	date: string;
}

/** Definitions of {@linkcode Menubox2} items with Font Awesome icons. */
interface IconizedMenuboxItemDef extends Menubox2ItemDefinition {
	icon?: string;
}

/** Data structure of the clipboard (which is an entry in the browser's `localStorage`). */
interface OwcClipboardData {
	/** Description of the data. */
	label: string;
	/** Actual data (stringified). */
	data: string;
	/** Expiration date after which the data will be deleted from the `localStorage`. */
	expires: string;
}

/** Data structure of a cached warband in the browser's `localStorage`. */
interface OwcRestorerItem {
	/** Hash value of the warband's code. */
	hash: string;
	/** The name of the cached warband. */
	title: string;
	/** Count of figures in the cached warband. */
	figures: number;
	/** Points value of the cached warband. */
	points: number;
	/** The warband's code. */
	code: string;
	/** Hashes of keys in the `localStorage` that contain the very same warband. */
	foundIn: Array<string>;
}

// DOC
interface OwcSettingsRecord {
	/** Enable the special rules of the "Song of Arthur and Merlin" rulebook. */
	"rulebook.sam.enabled": boolean;
	/** Enable the special rules of the "Song of Deeds and Glory" rulebook. */
	"rulebook.sdg.enabled": boolean;
	/** Enable the special rules of the "Song of Gold and Darkness" rulebook. */
	"rulebook.sgd.enabled": boolean;
	/** Enable the special rules of the "Song of Wind and Water" rulebook. */
	"rulebook.sww.enabled": boolean;
	/** Default quality value for new units. */
	"defaults.quality": number;
	/** Default combat value for new units. */
	"defaults.combat": number;
	/** Language code used by the editor/localizer. */
	"editor.language": string;
	/** Selected editor layout identifier. */
	"editor.layout": string;
	/** Display the figure count in the warband summary. */
	"editor.countFigures": boolean;
	/** Show personalities as points instead of percent. */
	"editor.personalitiesInPoints": boolean;
	/** Enable rule checking in the editor. */
	"editor.applyRuleChecks": boolean;
	/** Highlight personalities in the editor layout. */
	"editor.highlightPersonalities": boolean;
	/** Include warband code in print output. */
	"print.warbandCode": boolean;
	/** Include warning messages in print output. */
	"print.warnings": boolean;
}
