// @ts-check

// DOC
const localFileIo = new class
{
	/**
	 *
	 * @returns resolves to
	 */
	requestFile ()
	{
		return new Promise(resolve =>
		{
			const inputNode = makeElement("input", {
				type: "file",
				accept: "text/plain",
				style: "display:none",
				onchange: fileEvent =>
				{
					const fileReader = new FileReader();
					fileReader.onload = () => resolve(fileReader.result.toString());
					fileReader.readAsText(/** @type {HTMLInputElement} */(fileEvent.currentTarget).files[0]);
				}
			});
			document.body.appendChild(inputNode);
			inputNode.click();
			inputNode.remove();
		});
	}

	/**
	 *
	 * @param {string} filename
	 * @param {string} data
	 */
	offerDownload (filename, data)
	{
		const file = new Blob([data], { "type": "text/plain" });
		const anchorNode = makeElement("a", {
			style: "display:none",
			href: URL.createObjectURL(file),
			download: filename.replace(/[^a-z0-9\s\-_.]/ig, ""),
		});
		document.body.appendChild(anchorNode);
		anchorNode.click();
		anchorNode.remove();
	};
};

// DOC
const notifications = new class
{
	#currenCount = 0;
	#currentOffset = 0;

	/**
	 * Pops up a notification within the browser tab.
	 * @param {string} text The text to be displayed.
	 * @param {"green"|"yellow"|"red"} color Color of the notification. Defaults to `"green"`.
	 */
	notify (text, color = "green")
	{
		const element = makeElement("div.notification.popup." + color,
			makeElement("i.fa-solid." + {
				green: "fa-check-circle",
				red: "fa-times-circle",
				yellow: "fa-info-circle",
			}[color]),
			makeElement("span", text),
			{
				onanimationend: () =>
				{
					element.remove();
					if ((this.#currenCount -= 1) === 0)
					{
						this.#currentOffset = 0;
					}
				}
			}
		);
		document.body.appendChild(element);
		const rect = element.getBoundingClientRect();
		element.style.left = Math.round((document.body.clientWidth - rect.width) / 2) + "px";
		element.style.top = Math.round(rect.top + this.#currentOffset) + "px";
		this.#currenCount += 1;
		this.#currentOffset += rect.height + 6;
	}
};

// DOC
const ui = new class
{
	#spinner = document.getElementById("loading-spinner");

	constructor()
	{
		this.isTouchDevice = "ontouchstart" in document.documentElement;
	}

	wait ()
	{
		this.#spinner.style.display = null;
		this.#spinner.querySelector("i").style.animationPlayState = "running";
	}

	waitEnd ()
	{
		this.#spinner.style.display = "none";
		this.#spinner.querySelector("i").style.animationPlayState = "paused";
	}
};

// DOC
const inputHelper = new class
{
	/**
	 * // DOC: Review:
	 * Adds event listeners to all `[contenteditable]` and `input` elements within the given element to handle blur,
	 * focus or keydown events for managing blank and default values, prettifying text and alike.
	 * @param {HTMLElement} element Container of input elements to which to attach the input handler.
	 */
	attach (element)
	{
		for (const contenteditable of /** @type {NodeListOf<HTMLElement>} */(element.querySelectorAll("[contenteditable]")))
		{
			const blankReplacer = contenteditable.dataset.blank;
			if (!contenteditable.textContent.trim())
			{
				contenteditable.textContent = blankReplacer;
			}
			contenteditable.spellcheck = false;
			contenteditable.addEventListener("focus", () =>
			{
				if (contenteditable.textContent.trim() === blankReplacer)
				{
					contenteditable.textContent = "";
				}
			});
			const originalBlurEvent = contenteditable.onblur;
			contenteditable.onblur = (evt) =>
			{
				let prettifiedContent = contenteditable.textContent
					.trim()
					.replace(/\s+/g, " "); // Remove multiple whitespaces.
				switch (contenteditable.getAttribute("data-type"))
				{
					case "number":
						prettifiedContent = /\d+/.exec(contenteditable.textContent)?.[0] || "0";
						break;
					default:
						if (!prettifiedContent)
						{
							prettifiedContent = blankReplacer;
						}
				}
				contenteditable.textContent = prettifiedContent;
				originalBlurEvent?.call(contenteditable, evt);
			};
			contenteditable.addEventListener("keydown", e =>
			{
				switch (e.key)
				{
					case "Enter":
					case "Escape":
						contenteditable.blur();
						break;
				}
			});
		}
		for (const input of /** @type {NodeListOf<HTMLInputElement>} */(element.querySelectorAll("input")))
		{
			input.addEventListener("blur", () =>
			{
				input.dataset.value = input.value;
			});
		}
	}
};

/**
 * Normalizes a relative URL to an absolute URL in the current window location.
 * @param {string} relativeUrl The relative part of an URL.
 */
function absoluteUrl (relativeUrl)
{
	return window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + relativeUrl;
}

/**
 * Creates a new HTML element.
 * @see https://gist.github.com/chzager/aa4d64d486e2568aba03754f64ce1ebe
 * @param {string} definition The tag of the desired HTML element and optionally an Id and css classes, in a _query selector_ like notation (i.e. `"div#id.class1.class2"`).
 * @param  {...string | number | HTMLElement | {[key: string]: string | number | boolean | Function} } [content] Content (or children) to be created on/in the HTML element. This may be text content, child HTML elements or a record of attributes or event handlers.
 * @returns {HTMLElement} Returns the newly created HTML element with all its content and children.
 */
function makeElement (definition, ...content)
{
	const [_m, tagName, _g2, id, _g4, classes] = /^([a-z0-9]+)(#([^.\s\[]+))?(\.(.+))?/.exec(definition);
	const element = document.createElement(tagName);
	(!!id) && (element.id = id);
	(!!classes) && element.classList.add(...classes.split("."));
	for (let item of content.filter(i => (i !== null) && (i !== undefined)))
	{
		switch (typeof item)
		{
			case "bigint":
			case "boolean":
			case "number":
				element.appendChild(document.createTextNode(item.toString()));
				break;
			case "string":
				for (const [match, unicodeChar] of item.matchAll(/&#x([0-9a-f]+);/ig))
				{
					item = item.replace(match, JSON.parse("\"\\u" + unicodeChar + "\""));
				}
				element.appendChild(document.createTextNode(item));
				break;
			case "object":
				if (item instanceof HTMLElement)
				{
					element.appendChild(item);
				}
				else if (!Array.isArray(item))
				{
					for (const [key, value] of Object.entries(item))
					{
						if (typeof value === "string")
						{
							element.setAttribute(key, value);
						}
						else
						{
							element[key] = value;
						}
					}
				}
				else
				{
					throw new TypeError(`Expected String, Number, Object or HTMLElement, got ${item.constructor.name ?? typeof item}`);
				}
				break;
		}
	}
	return element;
};

/**
 * Extends the native `fetch()` method with transformation of the resource content accoring to its file extension.
 *  - `.json` files will return an object.
 *  - `.xml` files will return an `Document`.
 *  - Other files will return a string.
 * @param {string} url The desired resources URL. It may be a relative URL which will be extendend to the current window location.
 * @returns A Promise that resolves to the resources file content.
 */
async function fetchEx (url)
{
	const response = await fetch(absoluteUrl(url));
	if (!response.ok)
	{
		return new ReferenceError(`Getting "${url}" returned HTTP status code ${response.status}.`);
	}
	else
	{
		const responseText = await response.text();
		switch (/\.([a-z]+?)$/.exec(url)?.[1].toLowerCase())
		{
			case "json":
				return JSON.parse(responseText);
			case "xml":
				return new DOMParser().parseFromString(responseText, "text/xml");
			default:
				return responseText;
		}
	}
}

/**
 * Creator for menu items on {@linkcode Menubox2} which in extension to the default creator will create FontAwesome
 * icons on the menu items.
 * @param {IconizedMenuboxItemDef} def Definition of the menu item to be created.
 */
function iconizedMenuitemRenderer (def)
{
	const menuItem = Menubox2.itemRenderer(def);
	if (def.icon)
	{
		menuItem.insertBefore(makeElement("i." + def.icon.replaceAll(/\s/g, ".")), menuItem.firstChild);
	}
	return menuItem;
}

/**
 * // DOC
 * @param {string} string
 * @returns
 */
function stringHash (string)
{
	/* This is based on https://github.com/darkskyapp/string-hash
	Since the basic code is public domain, this function is public domain as well.
	 */
	let hash = 0;
	let i = string.length;
	while (i)
	{
		hash = (hash * 33) ^ string.charCodeAt(--i);
	}
	return hash >>> 0;
}

/**
 *
 * @param {string} text
 * @param {{[key: string]: any}} placeholders
 * @returns
 */
function stringFill (text, placeholders)
{
	for (const [match, key] of text.matchAll(/\{(\w+)\}/g))
	{
		text = text.replace(match, (placeholders[key] ?? match).toString());
	}
	return text;
}
