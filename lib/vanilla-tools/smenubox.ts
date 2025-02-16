interface SmenuboxDefinition {
	title?: string;
	css?: string;
	position?: "absolute" | "fixed";
	selectMode?: SmenuboxSelectMode;
	items: Array<SmenuboxItem | SmenuboxSeparator>;
	buttons?: Array<SmenuboxItem>;
}

interface SmenuboxItem {
	key: string;
	label?: string;
	icon?: string | HTMLElement;
	element?: HTMLElement;
	enabled: boolean;
}

interface SmenuboxSeparator {
	separator: true;
}

enum SmenuboxSelectMode {
	normal = 0,
	persistent = 1,
	multiselect = 2,
	multiselect_interactive = 3,
}

type SmenuboxCallback = (event: SmenuboxEvent) => void;

class SmenuboxEvent {
	smenuboxId: string;
	originalEvent: Event;
	itemKey?: string;
	buttonKey?: string;
	constructor(smenuboxId: string, originalEvent: Event, itemKey?: string, buttonKey?: string) {
		this.smenuboxId = smenuboxId;
		this.originalEvent = originalEvent;
		this.itemKey = itemKey;
		this.buttonKey = buttonKey;
	}
}

class Smenubox {
	static instances: Map<string, Smenubox> = new Map();
	static closeAll(exceptFor: string = "") {
		for (let smenubox of Smenubox.instances.values()) {
			if (exceptFor.startsWith(smenubox.id) === false && smenubox.id !== "__dialogbox__") {
				smenubox.close();
			}
		}
	}

	static onMenuItemClick(mouseEvent: MouseEvent) {
		let eventTarget: HTMLElement = HTMLElement(mouseEvent.target!);
		mouseEvent.stopPropagation();
		if (eventTarget instanceof HTMLInputElement === false && eventTarget.classList.contains("disabled") === false) {
			let menuboxItem = eventTarget.closest("[data-menuitem]");
			let menuboxButton = eventTarget.closest("[data-menubutton]");
			let menubox = Smenubox.instances[eventTarget.closest("[data-menubox]").getAttribute("data-menubox")];
			let submenuId = menuboxItem?.getAttribute("data-submenu");
			if (menuboxItem) {
				if (submenuId) {
					let submenu = menubox.submenus[submenuId];
					Smenubox.closeAll(submenuId);
					submenu.popup(mouseEvent, menubox.context, menuboxItem, submenu.alignment);
				} else if (menubox.multiselect) {
					menuboxItem.classList.toggle("selected");
				}
			}
			if ((menubox.selectMode === Smenubox.SELECT_MODE.normal || menuboxButton) && !submenuId) {
				Smenubox.closeAll();
			}
			if (menubox.selectMode !== Smenubox.SELECT_MODE.multiselect || menuboxButton) {
				/* dispatch event */
				let eventDetails = {
					context: menubox.context,
					menubox: menubox,
				};
				if (menuboxItem) {
					eventDetails.itemKey = menuboxItem.getAttribute("data-menuitem");
				} else if (menuboxButton) {
					eventDetails.buttonKey = menuboxButton.getAttribute("data-menubutton");
				}
				if (menubox.multiselect) {
					eventDetails.selectedKeys = [];
					for (let item of menubox.element.querySelectorAll("[data-menuitem].selected")) {
						eventDetails.selectedKeys.push(item.getAttribute("data-menuitem"));
					}
				}
				if (typeof menubox.eventHandler === "function") {
					menubox.eventHandler(Object.assign(eventDetails, { originalEvent: mouseEvent }));
				} else {
					window.dispatchEvent(new CustomEvent(Smenubox.EVENT_ID, { detail: eventDetails }));
				}
			}
		}
	}

	id: string;
	callback: SmenuboxCallback;
	parentMenubox: any;
	selectMode: SmenuboxSelectMode;
	items: {};
	// adjust: any;
	element: HTMLElement;
	constructor(id: string, options: SmenuboxDefinition, callback: SmenuboxCallback, _parentSmenubox?: Smenubox) {
		if (Smenubox.instances.has(id)) {
			console.info('Menubox "' + id + '" already existed, has been replaced.');
			document.body.querySelector('[data-menubox="' + id + '"]')?.remove();
		}
		this.id = id;
		this.callback = callback;
		this.parentMenubox = _parentSmenubox;
		this.selectMode = options.selectMode || SmenuboxSelectMode.normal;
		// this.multiselect = ([Menubox.SELECT_MODE.multiselect, Menubox.SELECT_MODE.multiselect_interactive].includes(this.selectMode));
		this.items = {};
		// this.adjust = Object.assign({visibility: ["hidden", "visible"]}, menuJson.adjust);
		this.element = newElement(
			"div.menubox", // wrapper DIV is required for transistions
			{
				"data-menubox": id,
				onclick: (evt) => {
					evt.stopPropagation();
				},
			},
			newElement("div", newElement("div.items"))
		);
		this.element.style.position = options.position || "absolute";
		this.element.style.top = "0px";
		this.element.style.left = "0px";
		if (typeof options.css === "string") {
			for (let cssClass of options.css.split(" ")) {
				this.element.classList.add(cssClass);
			}
		}
		// this.setTitle(menuJson.title);
		// this.setItems((menuJson.items instanceof Array) ? menuJson.items : menuJson);
		if (options.buttons instanceof Array) {
			let buttonsContainer = newElement("div.buttons");
			for (let menuButton of options.buttons) {
				buttonsContainer.appendChild(newElement("div.menubutton", { "data-menubutton": menuButton.key, onclick: Smenubox.onMenuItemClick }, menuButton.label ?? menuButton.key));
			}
			this.element.firstElementChild!.appendChild(buttonsContainer);
		}
		document.body.appendChild(this.element);
		Smenubox.instances.set(id, this);
		Smenubox.closeAll();
	}
	close() {}
}
