// @ts-check
/**
 * Developer's note: This is called "Bluebox" because in the very first version (anno 2009) this were actual blue boxes,
 * so the name was retained for nostalgic reasons.
 */
class Bluebox
{
	/** The currently displaying Bluebox. @type {Bluebox} */
	static current;

	/**
	 * Show this Bluebox.
	 * @param  {...any} args
	 * @abstract
	 */
	show (...args)
	{} // Abstract.

	/**
	 * Actually renders the Bluebox'es element and shows it on the document.
	 * **Call this in `show()` in the derived classes.**
	 * @param {string} snippetName The PageSnippet name of the Bluebox to show.
	 * @param {PageSnippetsProductionData} snippetData Data for the Bluebox.
	 * @protected
	 */
	open (snippetName, snippetData)
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
		this.element?.addEventListener("transitionend", () =>
		{
			this.element.remove();
			this.element = null;
		});
		this.element.style.top = "-100vh";
		Bluebox.current = null;
	}

	/**
	 * Closes the currently showing Bluebox (if any).
	 * @param {PointerEvent} event Triggering event.
	 */
	static closeCurrent (event)
	{
		if (event.currentTarget instanceof HTMLElement && !event.currentTarget.closest(".bluebox"))
		{
			Bluebox.current?.close();
		}

	}
}

document.body.addEventListener("click", evt => Bluebox.closeCurrent(evt));
