(function ()
{
	/**
	 * 
	 * @param {string} tag Tag of the HTML element
	 * @param {string | HTMLElement} [content]
	 * @param {{[k: string]: string | Function}} props 
	 * @param {string} [css] 
	 * @returns {HTMLElement}
	 */
	function _newElement (tag, content, props = {}, css = "")
	{
		let result = document.createElement(tag);
		for (let c of css.split(" "))
		{
			result.classList.add(c);
		}
		for (let prop in Object.entries(props))
		{
			if (typeof prop[1] === "function")
			{
				result[prop[0]] = prop[1];
			} else
			{
				result.setAttribute(prop[0], prop[1]);
			}
			if (typeof content === "string")
			{
				result.appendChild(document.createTextNode(content));
			}
			else if (content instanceof HTMLElement)
			{
				result.appendChild(content);
			}
			return result;
		}
	}

	/**
	 * 
	 * @param {string} title Title of the buttonbox
	 * @param {string | HTMLElement} content 
	 * @param {Array<ButtonboxButton>} buttons 
	 * @param {ButtonboxCallback} callback
	 * @param {*} options 
	 */
	globalThis.Buttonbox = function (title, content, buttons, callback, options)
	{
		let boxDiv = _newElement("div", null, {}, "buttonbox");
		if (!!title)
		{
			boxDiv.appendChild(_newElement("div", title, null, "buttonbox-title"));
		}
		boxDiv.appendChild(_newElement("div", content, null, "buttonbox-content"));
		let buttonsDiv = _newElement("div", null, {}, "buttonbox-buttons");
		for (let button of buttons)
		{
			boxDiv.appendChild(_newElement("div", button.label || button.html, { onclick: console.log }, "buttonbox-button"));
		}
		boxDiv.appendChild(buttonsDiv);
	};
}
)();
