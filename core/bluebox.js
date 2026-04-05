/**
 * Developer's note: This is called "Bluebox" because in the very first version (anno 2009) this were boxes
 * actually colored blue, so the name was retained for nostalgic reasons.
 */
class Bluebox
{
	/**
	 * The currently displaying Bluebox.
	 * @type {Bluebox|null}
	 */
	static current;

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
	 * @param {PageSnippetsProductionData} snippetData Data for the Bluebox.
	 * @protected Call {@linkcode show()} to pop up the Bluebox.
	 */
	render (snippetName, snippetData)
	{
		const blueboxContentElement = /** @type {HTMLElement} */(pageSnippets.produce(snippetName, snippetData));
		blueboxContentElement.classList.add("bluebox");
		blueboxContentElement.onclick = (evt) => evt.stopPropagation();
		this.element = makeElement("div.viewport.blueboxwapper", blueboxContentElement);
		this.element.firstElementChild.appendChild(makeElement("div.fa-regular.fa-circle-xmark.close-button", { onclick: () => this.close() }));
		document.body.appendChild(this.element);
		setTimeout(() => { this.element.style.top = "0"; }, 10);
		Bluebox.current = this;
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
				this.element = null;
			});
			this.element.style.top = "-100vh";
		}
		Bluebox.current = null;
	}
}

// When a Bluebox is active, any click outside of it will close it.
document.body.addEventListener("click", evt =>
{
	if (evt.currentTarget instanceof HTMLElement && !evt.currentTarget.closest(".bluebox"))
	{
		Bluebox.current?.close();
	}
});
