// @ts-check
/**
 * A modal dialog for user inputs (text or numbers).
 */
const inputDialog = new class
{
	/**
	 * An HTML element that locks the entire document (through overlaying the full viewport) and
	 * holds the actual input dialog element.
	 */
	#veil = document.body.appendChild(makeElement(
		"div#inputDialogVeil",
		{
			style: "display:none",
			onclick: (/** @type {PointerEvent} */evt) => (evt.target === this.#veil) && this.close()
		}
	));

	/** The HTML element that renders the input dialog on the document. @type {HTMLElement} */
	#element;

	/**
	 * Pops up an input dialog.
	 *
	 * @overload
	 * @param {"text"} type Type of the input value.
	 * @param {string} title Title of the dialog.
	 * @param {string} [value] Preset value.
	 * @returns {Promise<string>}
	 *
	 * @overload
	 * @param {"number"} type Type of the input value.
	 * @param {string} title Title of the dialog.
	 * @param {number} [value] Preset value.
	 * @param {number} [min] Minimum allowed number.
	 * @param {number} [max] Maximum allowed number.
	 * @returns {Promise<number>}
	 */
	prompt (type, title, value, ...args)
	{
		return new Promise(resolve =>
		{
			// Methods:
			const confirm = () =>
			{
				const value = this.#element.querySelector("input").value;
				resolve((type === "number") ? Number(value) : value);
				this.close();
			};
			// Actual code:
			const snippetData = {
				type: type,
				title: title,
				value: value,
				onKeyDown: (/** @type {KeyboardEvent} */evt) =>
				{
					if (["Enter", "NumpadEnter"].includes(evt.key))
					{
						confirm();
					}
				},
				onOk: () => confirm(),
			};
			if (type === "number")
			{
				Object.assign(snippetData, { min: args[0], max: args[1], });
			}
			this.#element = /** @type {HTMLElement} */(pageSnippets.produce("/components/inputPrompt", snippetData));
			this.#veil.appendChild(this.#element);
			this.#veil.style.display = "block";
			// Currently there is no definitive way to react when then virtual keyboard on a touch device
			// shrinks available height, so we set the position of the prompt menu to the upper quarter.
			this.#element.style.top = Math.round((window.innerHeight / 4) - (this.#element.offsetHeight / 2)) + "px";
			this.#element.style.left = Math.round((visualViewport.width - this.#element.offsetWidth) / 2) + "px";
			const inputElement = this.#element.querySelector("input");
			if (type === "text")
			{
				inputElement.focus();
				setTimeout(() =>
				{
					const length = inputElement.value.length;
					inputElement.setSelectionRange(length, length);
				}, 1);
			}
		});
	}

	/**
	 * Closes the current input dialog (removes the HTML element from the document and hides the veil).
	 */
	close ()
	{
		this.#veil.style.display = "none";
		this.#element?.remove();
	}
};
