// @ts-check
// DOC wntire file
const inputDialog = new class
{
	#veil = document.body.appendChild(makeElement(
		"div#inputDialogVeil",
		{
			onclick: (/** @type {PointerEvent} */evt) =>
			{
				if (evt.target === this.#veil)
				{
					this.close();
				}
			}
		}
	));

	/** @type {HTMLElement} */
	#element;

	/**
	 */
	constructor()
	{
		this.close();
	}

	/**
	 * @overload
	 * @param {"text"} type
	 * @param {string} title
	 * @param {string} [value]
	 * @returns {Promise<string>}
	 *
	 * @overload
	 * @param {"number"} type
	 * @param {string} title
	 * @param {number} [value]
	 * @param {number} [min]
	 * @param {number} [max]
	 * @returns {Promise<number>}
	 */
	prompt (type, title, value, ...args)
	{
		return new Promise(resolve =>
		{
			const confirm = () =>
			{
				const value = this.#element.querySelector("input").value;
				resolve((type === "number") ? Number(value) : value);
				this.close();
			};

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
			switch (type)
			{
				case "number":
					Object.assign({
						min: args[0],
						max: args[1],
					}, snippetData);
					break;
			}
			this.#element = /** @type {HTMLElement} */(pageSnippets.produce("/components/inputPrompt", snippetData));
			/* currently there is no definitive way to react when then virtual keyboard on touch device shrinks available height,
			so we set the position of the prompt menu to the upper quarter */
			this.#veil.appendChild(this.#element);
			this.#veil.style.display = "block";
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

	close ()
	{
		this.#veil.style.display = "none";
		this.#element?.remove();
	}

};
