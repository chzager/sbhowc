// @ts-check
// DOC entire file
/**
 * Developer's note: This is called "Bluebox" because in the very first version (anno 2009) this were actual blue boxes,
 * so the name was retained for nostalgic reasons.
 */
class Bluebox
{
	/** @type {Bluebox} */
	static current;

	/**
	 *
	 * @param  {...any} args
	 * @abstract
	 */
	show (...args)
	{
		// Abstract.
	}

	/**
	 *
	 * @param {string} snippetName
	 * @param {PageSnippetsProductionData} snippetData
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
	 *
	 * @param {PointerEvent} event
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
// document.body.addEventListener("click", evt => Bluebox.closeCurrent(evt));
