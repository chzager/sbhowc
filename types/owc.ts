// Genue basic type:
type ElementEventHandler<T extends HTMLElement, E extends Event = Event> = (
	event: E & { currentTarget: T }
) => any;

/** A special rule as it is assigned to an unit. */
interface OwcSpecialruleInstance {
	/** This specialrule's id as a reference to the specialrules resource. */
	key: string;
	/** Native label of the special rule. */
	label: string;
	/** Abbreviation of the rulebook where that specialrule was introduced. */
	rulebook: string;
	/** Points costs of this specialrule. */
	points: number;
	/** Whether this specialrule makes the unit a _personality_ (`true`) or not (`false`). */
	isPersonality: boolean;
	/** Indicates that this specialrule creates a separate pool point in the warband. */
	pooling: boolean;
	/** Additional text that specifies this specialrule in more detail. */
	additionalText?: string;
}

/** Default values for new units. */
interface OwcUnitDefaults {
	/** Default quality value for units. */
	quality: number;
	/** Default combat value for units. */
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

//#region Specialrules
/** Special rules file data structure. */
interface OwcRulebookJson {
	/** Rulebook (abbreviation) that introduces this specialrules. */
	id: string;
	/** A list of specialrule definitions. */
	data: {
		[key: string]: OwcRulebookJson_Specialrule;
	};
}
/** A single special rule in a specisl rules file. */
interface OwcRulebookJson_Specialrule {
	/** Label of this specialrule. The actual display text comes from a locales file. */
	label: string;
	/** Points costs of this specialrule. */
	points: number;
	/** Whether this specialrule makes a unit a personality (true) or not (false). */
	personality?: boolean;
	/** Indicates that this specialrule needs a specification at the unit. */
	needsSpecification?: boolean;
	/** Keys of other specialrules that are replaced by this specialrule (e.g. 'Shooter (long)' replaces 'Shooter (medium)'). */
	replaces?: Array<string>;
	/** Keys of other specialrules that are variants of this specialrule. */
	variants?: Array<string>;
	/** Keys of other specialrules that are excluded for units having this specialrule. */
	excludes?: Array<string>;
	/** Indicates that this specialrule creates a separate pool point on the unit's warband. */
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

// DOC everything from here
// OK 2025-11-04
interface OwcValidationResult {
	key: string;
	values?: { [x: string]: string | number }
}

/** Method type for performing specific validations of the warband. */
type OwcValidationFunction = () => OwcValidationResult | Array<OwcValidationResult>;

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
