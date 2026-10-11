/**
 * Developer's note: This is called "Bluebox" because in the very first version (anno 2009) this were boxes
 * actually colored blue, so the name was retained for nostalgic reasons.
 */
class Bluebox
{
	/**
	 * The Bluebox's element on the document.
	 * @type {HTMLElement}
	 */
	#blueboxVeil;

	/**
	 * The Bluebox's element on the document.
	 * @type {HTMLElement}
	 * @protected
	 */
	element;

	/**
	 * Pops up the Bluebox (renders it's element on the document and triggers the "fly-in" animation).
	 * @param {...any} args
	 * @abstract
	 */
	show (...args)
	{
		throw new Error("Abstract method 'show' must be implemented by subclass.");
	}

	/**
	 * Actually renders the Bluebox's element onto the document.
	 * @param {string} snippetName The PageSnippet name of the Bluebox to show.
	 * @param {PageSnippets.ProductionData} snippetData Data for the Bluebox.
	 * @protected Call {@linkcode show()} to pop up the Bluebox.
	 */
	render (snippetName, snippetData)
	{
		this.#blueboxVeil = document.getElementById("bluebox-veil");
		if (!this.#blueboxVeil)
		{
			this.#blueboxVeil = makeElement("div#bluebox-veil");
			document.body.appendChild(this.#blueboxVeil);
		}
		this.#blueboxVeil.style.display = null;
		const blueboxContentElement = pageSnippets.produce(snippetName, snippetData);
		blueboxContentElement.classList.add("bluebox");
		blueboxContentElement.onclick = (ev) => ev.stopPropagation();
		this.element = makeElement("div.viewport.blueboxwapper", blueboxContentElement);
		this.#blueboxVeil.appendChild(this.element);
		setTimeout(() => { this.element.style.top = "0"; }, 10);
		this.#blueboxVeil.onclick = () => this.close();
	}

	/**
	 * Closes the Bluebox.
	 */
	close ()
	{
		if (this.element)
		{
			this.element.addEventListener("transitionend", () =>
			{
				this.element?.remove();
				this.element = undefined;
				this.#blueboxVeil.style.display = "none";
			});
			this.element.style.top = "-100vh";
		}
	}
}
