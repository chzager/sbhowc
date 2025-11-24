// DOC entire file
//#region Baseline
type ElementEventHandler<T extends HTMLElement, E extends Event = Event> = (
	event: E & { currentTarget: T }
) => any;
//#endregion


/**
 * // DOC: Update --> Special ability for a unit.
 */
interface OwcSpecialruleInstance {
	/** This specialrule's id as a reference to the specialrules resource. */
	key: string;
	label: string;
	rulebook: string;
	/** Points costs of this specialrule. */
	points: number;
	/** Whether this specialrule makes the unit a _personality_ (`true`) or not (`false`). */
	isPersonality: boolean;
	pooling: boolean;
	/** Additional text that specifies this specialrule in more detail. */
	additionalText?: string;
}
//#endregion


//#region Settings
interface OwcSettingsProperties {
	langauge: string;
	ruleScope: Array<string>;
	defaults: OwcUnitDefaults;
	editorLayout: string;
}
interface OwcSettingsOptions {
	countFigures: boolean;
	highlightPersonalities: boolean;
	personalitiesInPoints: boolean;
	applyRuleChecks: boolean;
}
interface OwcUnitDefaults {
	/** Default quality value for units. */
	quality: number;
	/** Default combat value for units. */
	combat: number;
}
//#endregion


//#region Specialrules
/**
 * Root interface representing the schema for special rules.
 */
interface OwcRulebookJson {
	/** Rulebook (abbreviation) that introduces this specialrules. */
	id: string;
	/** A list of specialrule definitions. */
	data: {
		[key: string]: OwcRulebookJson_Specialrule;
	};
}
/**
 * Definition of a single special rule.
 */
interface OwcRulebookJson_Specialrule {
	/** Label of this specialrule. Note that the actual display text comes from a locales file. */
	label: string;
	/** Points costs of this specialrule. */
	points: number;
	/** Whether this specialrule makes a unit a personality (true) or not (false). */
	personality?: boolean;
	/** Indicates that this is a generic specialrule that needs specification in the unit. */
	generic?: boolean;
	/** Ids of other specialrules that are replaced by this specialrule (e.g. 'Shooter (long)' replaces 'Shooter (medium)'). */
	replaces?: Array<string>;
	/** Ids of other specialrules that are variants of this specialrule. */
	variants?: Array<string>;
	/** Ids of other specialrules that are excluded for units having this specialrule. */
	excludes?: Array<string>;
	/** Indicates that this specialrule creates a separate pool point on the unit's warband. */
	pooling?: boolean;
}

interface OwcSpecialruleDirectoryEntry extends OwcRulebookJson_Specialrule {
	key: string;
	rulebook: string;
}
//#endregion

// OK 2025-11-04
interface OwcUndoerSnapshot {
	warbandCode: string;
	label: string;
	pointsModification: number;
}

// OK 2025-11-04
interface OwcValidationResult {
	key: string;
	values?: { [x: string]: string | number }
}
// OK 2025-11-04
type OwcValidationFunction = () => OwcValidationResult | Array<OwcValidationResult>;

interface OwcLocalstorageData {
	title: string;
	figures: number;
	points: number;
	data: string;
	date: string;
}

interface IconizedMenuboxItemDef extends Menubox2ItemDefinition {
	icon?: string;
}


interface OwcClipboardData {
	label: string;
	data: string;
	expires: string;
}
interface OwcRestorerItem {
	/** Hash value opf the warband's code. */
	hash: string;
	title: string;
	figures: number;
	points: number;
	/** The warband's code. */
	code: string;
	foundIn: Array<string>;
}
