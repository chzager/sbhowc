/*
This is a file from Vanilla-Tools (https://github.com/suppenhuhn79/vanilla-tools)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */

/* requires htmlbuilder.js */


/**
 * @typedef Menubox2Definition
 * @property {string} [title]
 * @property {string} [css]
 * @property {"absolute" | "fixed"} [position]
 * @property {keyof Menubox2.SELECT_MODE} [selectMode]
 * @property {Array<Menubox2Item | Menubox2Separator>} [items]
 * @property {Array<Menubox2Item>} [buttons]
 *
 */

//** */
class Menubox2Item
{
	constructor(key, label) {};
}

class Menubox2
{
	static SELECT_MODE = {
		normal: "normal",
		persistent: "persistent",
		multiselect: "multiselect",
		multiselect_interactive: "multiselect_interactive"
	};

	/**
	 * @type {Map<string, Menubox2>}
	 */
	static instances = new Map();

	/**
	 *
	 * @param {string} exceptFor
	 */
	static closeAll (exceptFor = "")
	{
		for (let menubox of Menubox2.instances.values())
		{
			if (exceptFor.startsWith(menubox.id) === false)
			{
				menubox.close();
			}
		}
	};

	/**
	 *
	 * @param {Event} mouseEvent
	 */
	static onMenuItemClick (mouseEvent)
	{
		/**
		 *
		 * @param {HTMLElement} ele
		 * @param {string} attr
		 */
		function _closestAttribute (ele, attr)
		{
			return ele.closest("[data-" + attr + "]")?.dataset[attr];
		}
		let eventTarget = mouseEvent.target;
		mouseEvent.stopPropagation();
		if ((eventTarget instanceof HTMLInputElement === false) && (eventTarget.classList.contains("disabled") === false))
		{
			/** @type {Menubox2} */
			let menubox = Menubox2.instances.get(_closestAttribute(eventTarget, "menubox"));
			/** @type {HTMLElement} */
			let menuboxItem = eventTarget.closest("[data-menuitem]");
			/** @type {HTMLElement} */
			let menuboxButton = eventTarget.closest("[data-menubutton]");
			let callbackData = {
				context: menubox.context,
				menubox: menubox,
				originalEvent: mouseEvent
			};
			if (menuboxItem)
			{
				let submenuId = menuboxItem?.dataset["submenu"];
				if (submenuId)
				{
					let submenu = menubox.submenus[submenuId];
					Menubox2.closeAll(submenuId);
					submenu.popup(mouseEvent, menubox.context, menuboxItem, submenu.alignment);
				}
				else if (menubox.multiselect)
				{
					menuboxItem.classList.toggle("selected");
				}
			}
			if (((menubox.selectMode === Menubox2.SELECT_MODE.normal) || (menuboxButton)) && (!submenuId))
			{
				Menubox2.closeAll();
			}
			if ((menubox.selectMode !== Menubox2.SELECT_MODE.multiselect) || (menuboxButton))
			{
				if (menuboxItem)
				{
					callbackData.itemKey = menuboxItem.getAttribute("data-menuitem");
				}
				else if (menuboxButton)
				{
					callbackData.buttonKey = menuboxButton.getAttribute("data-menubutton");
				}
				if (menubox.multiselect)
				{
					callbackData.selectedKeys = [];
					for (let item of menubox.element.querySelectorAll("[data-menuitem].selected"))
					{
						callbackData.selectedKeys.push(item.getAttribute("data-menuitem"));
					}
				}
				menubox.eventHandler(Object.assign(callbackData, {}));
			}
		}
	};

	/**
	 *
	 * @param {string} id
	 * @param {Menubox2Definition} options
	 * @param {*} callback
	 * @param {Menubox2} [_parentMenubox]
	 */
	constructor(id, options, callback, _parentMenubox = null)
	{
		if (Menubox2.instances.has(id))
		{
			console.info("Menubox \"" + this.id + "\" already existed, has been replaced.");
			document.body.querySelector("[data-menubox=\"" + id + "\"]")?.remove();
		}
		this.id = id;
		this.callback = callback;
		this.parentMenubox = _parentMenubox;
		this.selectMode = options.selectMode ?? ((options.multiselect === true) ? Menubox2.SELECT_MODE.multiselect : Menubox2.SELECT_MODE.normal);
		this.multiselect = ([Menubox2.SELECT_MODE.multiselect, Menubox2.SELECT_MODE.multiselect_interactive].includes(this.selectMode));
		/** @type {Map<string, Menubox2Item>} */
		this.items = new Map();
		this.adjust = Object.assign({ visibility: ["hidden", "visible"] }, options.adjust);
		this.element = htmlBuilder.newElement("div.menubox", // wrapper DIV is required for transistions
			{ 'data-menubox': id, onclick: (evt) => { evt.stopPropagation(); } },
			htmlBuilder.newElement("div", htmlBuilder.newElement("div.items"))
		);
		if (_parentMenubox)
		{
			this.element.classList.add("submenu");
		}
		htmlBuilder.styleElement(this.element, {
			position: options.position ?? "absolute",
			top: "0px",
			left: "0px"
		});
		if (typeof options.css === "string")
		{
			for (let cssClass of options.css.split(" "))
			{
				this.element.classList.add(cssClass);
			}
		}
		this.setTitle(options.title);
		this.setItems(options.items || []);
		/*
		if (options.buttons instanceof Array)
		{
			let buttonsContainer = htmlBuilder.newElement("div.buttons");
			for (let menuButton of options.buttons)
			{
				buttonsContainer.appendChild(htmlBuilder.newElement("div.menubutton",
					{ 'data-menubutton': menuButton.key, onclick: Menubox2.onMenuItemClick },
					menuButton.label ?? menuButton.key)
				);
			}
			this.element.firstElementChild.appendChild(buttonsContainer);
		}
		*/
		document.body.appendChild(this.element);
		Menubox2.instances.set(this.id, this);
		Menubox2.closeAll();
	};

	_setVisibility (visible)
	{
		let styleIndex = (visible) ? 1 : 0;
		for (let key in this.adjust)
		{
			let styleValue = this.adjust[key][styleIndex];
			if ((key === "height") && (styleValue === "auto"))
			{
				styleValue = this.element.firstElementChild.offsetHeight + "px";
			}
			else if ((key === "width") && (styleValue === "auto"))
			{
				styleValue = this.element.firstElementChild.offsetWidth + "px";
			}
			this.element.style[key] = styleValue;
		}
	};

	/**
	 *
	 * @param {Array<Menubox2Item>} itemDefs
	 */
	setItems (itemDefs)
	{
		this.items.clear();
		while (this.element.firstChild)
		{
			this.element.firstChild.remove();
		}
		for (let itemDef of itemDefs)
		{
			this.appendItem(itemDef);
		}
	};

	/**
	 *
	 * @param {Menubox2Item} itemDef
	 */
	appendItem (itemDef)
	{
		function _copyProperties (itemDef, itemElement)
		{
			for (let itemDefKey in itemDef)
			{
				if (["key", "label", "input"].includes(itemDefKey) === false)
				{
					itemElement[itemDefKey] = itemDef[itemDefKey];
				}
			}
		}
		function _createInputElement (itemDef)
		{
			let inputElement = htmlBuilder.newElement("input", { type: itemDef.input });
			_copyProperties(itemDef, inputElement);
			return inputElement;
		}
		function _createSubmenu (menubox, itemElement, itemDef)
		{
			let submenuId = menubox.id + "::" + itemDef.key;
			itemElement.setAttribute("data-submenu", submenuId);
			itemElement.classList.add("submenu");
			menubox.submenus ??= {};
			menubox.submenus[submenuId] = new Menubox2(submenuId, itemDef.submenu, menubox.eventHandler, menubox);
			menubox.submenus[submenuId].alignment = itemDef.submenu.alignment ?? "start right, below top";
		}
		function _appendItemObject (menubox, itemKey, itemElement)
		{
			menubox.items[itemKey] = {
				label: itemDef.label,
				get selected () { return itemElement.classList.contains("selected"); },
				set selected (selected)
				{
					if (menubox.multiselect === false)
					{
						for (let item of menubox.element.querySelectorAll("[data-menuitem].selected"))
						{
							item.classList.remove("selected");
						}
					}
					(selected) ? itemElement.classList.add("selected") : itemElement.classList.remove("selected");
				},
				get enabled () { return !itemElement.classList.contains("disabled"); },
				set enabled (enabled = true) { (enabled) ? itemElement.classList.remove("disabled") : itemElement.classList.add("disabled"); },
				setVisible: (visible = true) => { itemElement.style.display = (visible) ? null : "none"; },
				element: itemElement
			};
		}

		let itemElement;
		if (itemDef.separator)
		{
			itemElement = htmlBuilder.newElement("div.separator", "\u00a0");
		}
		/*
		else if (itemDef.href)
		{
			itemElement = htmlBuilder.newElement("a.menuitem", itemDef.label ?? itemDef.href, { onclick: (evt) => Menubox2.closeAll() });
			_copyProperties(itemDef, itemElement);
		}
		*/
		else if ((itemDef.html) && (itemDef.key === undefined))
		{
			itemElement = itemDef.html;
		}
		else if (itemDef.key !== undefined)
		{
			if (this.items.has(itemDef.key) === false)
			{
				itemElement = htmlBuilder.newElement("div.menuitem",
					{ 'data-menuitem': itemDef.key, onclick: itemDef.onclick ?? Menubox2.onMenuItemClick },
					itemDef.html ?? itemDef.label ?? ((itemDef.input) ? "" : itemDef.key)
				);
				if (itemDef.input)
				{
					itemElement.appendChild(_createInputElement(itemDef));
				}
				else if (itemDef.submenu)
				{
					_createSubmenu(this, itemElement, itemDef);
				}
				else if (this.multiselect)
				{
					itemElement.classList.add("multiselect");
				}
				_appendItemObject(this, itemDef.key, itemElement);
			}
			else
			{
				console.warn("Menubox item \"" + itemDef.key + "\" does already exist.", this, itemDef);
			}
		}
		if (itemElement)
		{
			if (itemDef.icon)
			{
				itemElement.insertBefore(htmlBuilder.newElement("img", { src: itemDef.icon }), itemElement.firstChild);
			}
			else if (itemDef.iconHtml)
			{
				itemElement.insertBefore(itemDef.iconHtml, itemElement.firstChild);
			}
			else if (itemDef.iconFontAwesome)
			{
				console.warn("iconFontAwesome is deprecated.");
				itemElement.insertBefore(htmlBuilder.newElement("i." + itemDef.iconFontAwesome.replace(" ", ".")), itemElement.firstChild);
			}
			if (itemDef.selected)
			{
				itemElement.classList.add("selected");
			}
			if (itemDef.enabled === false)
			{
				itemElement.classList.add("disabled");
			}
			this.element.querySelector("div.items").appendChild(itemElement);
		}
	};

	selectItem (itemKey, beSelected = true) // DEPRECATED: use `this.items.get().selected` instead
	{
		this.items.get(itemKey).selected = beSelected;
	};

	setTitle (title) // TODO: this be a setter
	{
		let wrapperElement = this.element.firstElementChild;
		if (typeof title === "string")
		{
			let titleElement = wrapperElement.querySelector(".title");
			if (!titleElement)
			{
				titleElement = htmlBuilder.newElement("div.title");
				wrapperElement.insertBefore(titleElement, wrapperElement.firstElementChild);
			}
			titleElement.innerText = title;
		}
		else
		{
			wrapperElement.querySelector(".title")?.remove();
		}
	};

	popup (mouseEvent, context = null, anchorElement = null, adjustment = "start left, below bottom")
	{
		if (!this.parentMenubox)
		{
			Menubox2.closeAll();
		}
		let itemsElement = this.element.querySelector("div.items");
		let isFixed = (this.element.style.position === "fixed");
		let scrollPos = (isFixed) ? { top: 0, left: 0 } : { top: document.documentElement.scrollTop, left: document.documentElement.scrollLeft };
		itemsElement.scrollTo({ top: 0 });
		htmlBuilder.styleElement(itemsElement, {
			height: null,
			overflowY: null
		});
		if (mouseEvent instanceof MouseEvent)
		{
			mouseEvent.stopPropagation();
			if ((anchorElement instanceof HTMLElement) === false)
			{
				htmlBuilder.styleElement(this.element, {
					top: mouseEvent.clientY + scrollPos.top + "px",
					left: mouseEvent.clientX + scrollPos.left + "px"
				});
			}
		}
		if (anchorElement instanceof HTMLElement)
		{
			htmlBuilder.adjust(this.element, anchorElement, adjustment);
		}
		/* prevent menubox exceeds viewport */
		let elementRect = this.element.getBoundingClientRect();
		if (elementRect.right > window.innerWidth)
		{
			this.element.style.left = Math.round(Math.max(scrollPos.left, scrollPos.left + window.innerWidth - elementRect.width)) + "px";
		}
		if (elementRect.bottom > window.innerHeight)
		{
			this.element.style.top = Math.round(Math.max(scrollPos.top, scrollPos.top + window.innerHeight - elementRect.height)) + "px";
			if (elementRect.height > window.innerHeight)
			{
				itemsElement.style.height = (itemsElement.offsetHeight - (elementRect.height - window.innerHeight)) + "px";
				itemsElement.style.overflowY = "scroll";
			}
		}
		this.context = context;
		this._setVisibility(true);
	};

	close ()
	{
		this._setVisibility(false);
	};

};

window.addEventListener("click", () =>
{
	if (eventTarget.closest("[data-menubox]") === null)
	{
		Menubox2.closeAll();
	}
});
window.addEventListener("keydown", (keyEvent) =>
{
	if (keyEvent.keyCode === 27) // DEPRECATED keyCode
	{
		Menubox2.closeAll();
	}
});
