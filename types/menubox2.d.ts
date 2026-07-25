/**
 * Menubox - pop-up GUI elements as menus for web applications.
 * @version 1.1.4
 * @copyright (c) 2024 Christoph Zager
 * @license MIT
 * @link https://github.com/chzager/menubox
 */
declare class Menubox2<ContextType> {
	static SELECT_MODE: {
		/** When an item is clicked, the callback is called and the menubox closes. (default) */
		normal: "normal";
		/** When an item is clicked, the callback is called but the menubox remains open until it is closed manually. */
		persistent: "persistent";
		/** When an item is clicked, its checked state toggles. The menubox remains open until closed manually. */
		multiselect: "multiselect";
		/** Like "multiselect", but every item click calls the callback so you can react to it. */
		multiselect_interactive: "multiselect_interactive";
	};

	/** Map of all menubox instances. */
	static instances: Map<string, Menubox2<any>>;

	/** Closes all menuboxes. */
	static closeAll(): void;

	/** Default creator for a menu item's representation HTML element. */
	static itemRenderer: Menubox2.ItemRenderFunction;

	/**
	 * @param id Id of this menubox.
	 * @param options Definition of how this menubox is to be created.
	 */
	constructor(id: string, options: Menubox2.Definition);

	/** Unique identifier of the menubox. */
	id: string;

	/** HTML element that represents this menubox on the document. */
	element: HTMLElement;

	/** Items in this menubox. */
	readonly items: Array<Menubox2Item<ContextType>>;

	/** Renderer to create the HTML elements that represent a single menu item. */
	itemRenderer: Menubox2.ItemRenderFunction;

	/** Directives how to align this menubox to another element. */
	align: Menubox2.Alignment;

	/** Delay in milliseconds before a submenu is opened after hovering. Default is `300`ms. */
	submenuDelay: number;

	/** Current context of the menubox. This is set on {@linkcode popup()} or {@linkcode toggle()}. */
	context: ContextType;

	/** Event handler invoked before the menubox actually opens. */
	beforePopup: (menubox: Menubox2<ContextType>, event: PointerEvent) => void;

	/** Callback function for clicks on menu items. */
	callback: Menubox2.Callback<ContextType>;

	/** Mode of how menubox items can be selected. */
	selectMode: keyof typeof Menubox2.SELECT_MODE;

	/** The parent menubox if this is a submenu. */
	parentMenubox?: Menubox2<any>;

	/** Returns the root menubox, especially for a submenubox. */
	readonly rootMenubox: Menubox2<any>;

	/** `true` if the menubox allows selecting multiple items. */
	readonly isMultiselect: boolean;

	/**
	 * Pops up the menubox.
	 * @param mouseEvent Triggering event. If this is triggered by a pointer event, this **must** be passed here, otherwise the menubox is closed immediately after opening.
	 * @param context Context in which the menubox was opened.
	 * @param anchorElement Element in document to which align the menubox. If omitted, the menubox is aligned to the pointer position.
	 */
	popup(mouseEvent: PointerEvent, context?: ContextType, anchorElement?: HTMLElement): void;

	/**
	 * Closes the menubox.
	 * @param closeSubmenus If `true` all submenus of this box will be closed. Default `false`.
	 */
	close(closeSubmenus?: boolean): void;

	/**
	 * Pops up the menubox if it is not yet opened. Closes the menubox if it is already opened.
	 * @param mouseEvent Triggering event. If this is triggered by a pointer event, this **must** be passed here, otherwise the menubox is closed immediately after opening.
	 * @param context Context in which the menubox was opened.
	 * @param anchorElement Element in document to which align the menubox. If omitted, the menubox is aligned to the pointer position.
	 * @returns {boolean} `true` if the menubox is being shon now, `false` if it was closed.
	 */
	toggle(mouseEvent: PointerEvent, context?: ContextType, anchorElement?: HTMLElement): boolean;

	/** Closes all submenus of this menubox. The menubox itself remains open. */
	closeSubmenus(): void;

	/** Returns all items of this menubox that currently have the checked state. */
	getCheckedItems(): Menubox2Item<ContextType>[];

	/**
	 * Returns the menu item for a given key.
	 * @param key Key of the desired menu item.
	 */
	getItemByKey(key: string): Menubox2Item<ContextType>;

	/**
	 * Removes all current items form the menubox and creates new from the given definitions.
	 * @param itemDefs The new items for the menubox.
	 */
	replaceItems(itemDefs: Array<Menubox2.ItemDefinition>): void;
}

/** An item of a menubox. */
declare class Menubox2Item<ContextType> {
	/** The key of this menu item. */
	key?: string;

	/** Menubox that owns this menu item. */
	menubox: Menubox2<ContextType>;

	/** HTML element that represents this menu item. */
	element: HTMLElement;

	/**
	 * A submenu that opens on this menu item.
	 *
	 * Menu items with submenus do not trigger the callback and do not close the
	 * menubox when clicked.
	 */
	submenu: Menubox2<ContextType>;

	/** Tells whether the item has the "checked" state or not. */
	checked: boolean;

	/**
	 * Tells whether the item is enabled or not. Disabled items do not trigger the callback when they are clicked.
	 * Only enabled items with a key trigger callbacks on clicks.
	 */
	enabled: boolean;

	/**
	 * @param properties Properties of the menu item.
	 * @param parent Menubox that owns this menu item. If omitted, the default constructor function of `Menubox2Item` is used.
	 */
	constructor(properties: any, parent: Menubox2<ContextType>);

	/** The label of the menu item. This is the text that is being displayed in the document. */
	get label(): string;
}

declare namespace Menubox2 {
	/** Definition of a menubox to be created. */
	interface Definition {
		/** Additional CSS classes. Single string, multiple entries separated by space. */
		css?: string;

		/**
		 * Positioning of the menubox on the viewport.
		 * - `"absolute"`: The menubox remains an the document position while scrolling. (Default)
		 * - `"fixed"`: The menubox stays at the viewport position even if the document scrolls.
		 */
		position?: "absolute" | "fixed";

		/** Directives for aligning the menubox to another element on popup. */
		align?: Alignment;
		/** @deprecated Use {@linkcode align} instead. */
		adjustment?: Alignment;

		/** CSS styles to apply on the menubox when opening. The first value is for closed state, the second value is for opened state. Remember to declare matching transitions in the CSS class of the menubox. */
		transitions?: Transitions;

		/**
		 * Mode of how menubox items can be selected.
		 * - `"normal"`: When an item is clicked, callback is called and the menubox closes. (default)
		 * - `"persistent"`:  When an item is clicked, callback is called but the menubox remains opened, you need to close it manually.
		 * - `"multiselect"`: When an item is clicked, its "checked" state toggels. The menubox remains opened until closed manually.
		 * - `"multiselect_interactive"`: Like "multiselect", but every item click calls the callback so you can react on it.
		 */
		selectMode?: keyof typeof Menubox2.SELECT_MODE;

		/** Event handler before the menu acutally pops up. */
		beforePopup?: (menubox: Menubox2<any>, event: PointerEvent) => void;

		/** Callback function when a menubox item is clicked. */
		callback?: Callback<any>;

		/** List of items in the menubox. */
		items: Array<ItemDefinition | Separator>;

		/** Function to create HTML elements for menubox items. */
		itemRenderer?: ItemRenderFunction;

		/** Delay in milliseconds before a submenu opens after hovering. */
		submenuDelay?: number;
	}

	/** Directives for align a menubox to another element. */
	type Alignment = {
		/** Horizontal alignment. Default is "right". */
		horizontal?: "before" | "left" | "right" | "after" | "center";

		/** Vertical alignment. Default is "below". */
		vertical?: "above" | "top" | "bottom" | "below" | "middle";
	}

	/**
	 * Callback function when a menubox item is clicked.
	 * @param item The menubox item that has been clicked.
	 */
	type Callback<ContextType> = (item: Menubox2Item<ContextType>) => any;

	/** Definition of a menubox item for creation. */
	interface ItemDefinition {
		/** Key of the item. Only items with a key trigger callbacks on clicks. */
		key?: string;

		/** Label of the item to be displayed on the menubox. */
		label?: string;

		/** Individual callback function for this menu item. */
		callback?: Callback<any>;

		/** Whether the item has the `checked` state. Default is `false`. */
		checked?: boolean;

		/** Whether the item is enabled for clicks. Default is `true`. */
		enabled?: boolean;

		/** Additional classes for the menu item. */
		cssClasses?: string[];

		/**
		 * A submenu that expands when this menu item is hovered or clicked.
		 *
		 * The submenu ID is auto-generated from the parent menubox ID and the menu item key.
		 * Therefore, menu items with submenus must have a key.
		 */
		submenu?: Definition;

		/** Any additional properties for custom item render functions. See {@linkcode Menubox2.ItemRenderFunction}. */
		[k: string]: any;
	}

	/** A separator between menubox items. */
	type Separator = {
		separator: any;
	}

	/** CSS styles to apply on the menubox in closed or open state. Remember to declare matching transitions in the CSS for the menubox. */
	type Transitions = {
		[property: string]: {
			/** Property value when the menubox is opened. */
			opened: string;
			/** Property value when the menubox is closed. */
			closed: string;
		}
	}

	/**
	 * Function that constructs an HTML element representing a menu item.
	 * @param itemProps Properties of the menu item used to construct its HTML representation.
	 */
	type ItemRenderFunction = (itemProps: ItemDefinition) => HTMLElement;
}
