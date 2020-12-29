"use strinct";

class dhtml
{
	static createNode(nameWithOptionalId, cssClass, attributes, content)
	{
		let decomposedName = /([^#]+)#?(\S*)/g.exec(nameWithOptionalId);
		let result = document.createElement(decomposedName[1]);
		if (decomposedName[2] !== "")
		{
			result.id = decomposedName[2];
		};
		if (cssClass)
		{
			let cssClasses = cssClass.split(" ");
			for (let c = 0; c < cssClasses.length; c += 1)
			{
				result.classList.add(cssClasses[c]);
			};
		};
		for (let attributeKey in attributes)
		{
			result.setAttribute(attributeKey, attributes[attributeKey]);
		};
		if (content)
		{
			if (content.constructor === String)
			{
				result.innerHTML = content;
			}
			else if (content.constructor === Array)
			{
				for (let i = 0; i < content.length; i += 1)
				{
					result.appendChild(content[i]);
				};
			}
			else
			{
				result.appendChild(content);
			};
		};
		return result;
	};

	static createNode2(nameExt, attributes = {}, content = null)
	{
		let htmlTag = /^[^#.\s]+/.exec(nodeDefinition)[0];
		let idRex = /#([^.\s]+)/;
		let cssClassesRex = /\.([^.\s]+)/g;
		let id = "";
		if (idRex.test(nodeDefinition) === true)
		{
			id = idRex.exec(nodeDefinition)[1];
		};
		let cssClasses = [];
		let cssClassMatch = cssClassesRex.exec(nodeDefinition);
		while (cssClassMatch != null)
		{
			cssClasses.push(cssClassMatch[1]);
			cssClassMatch = cssClassesRex.exec(nodeDefinition);
		};
		let result = document.createElement(htmlTag);
		result.id = id;
		for (let c = 0; c < cssClasses.length; c += 1)
		{
			result.classList.add(cssClasses[c]);
		};
		for (let attributeKey in attributes)
		{
			result.setAttribute(attributeKey, attributes[attributeKey]);
		};
		if (content != null)
		{
			if (typeof content !== "object")
			{
				result.innerHTML = content.toString();
			}
			else if (content instanceof HTMLElement === true)
			{
				result.appendChild(content);
			}
			else
			{
				throw new TypeError("content must be either a non-object primitive or an instanceof HTMLElement, given is " + content.constructor.name);
			};
		};
		return result;
	};

	static clearNode(result)
	{
		while (result.firstChild)
		{
			result.removeChild(result.firstChild);
		};
	};

	static removeNodesByQuerySelectors(querySelectors, rootNode = document)
	{
		let s = 0;
		let ss = querySelectors.length;
		for (s; s < ss; s += 1)
		{
			let nodes = rootNode.querySelectorAll(querySelectors[s]);
			let n = 0;
			let nn = nodes.length;
			for (n; n < nn; n += 1)
			{
				nodes[n].remove();
			};
			console.groupEnd();
		};
	};

	static removeClasses(classes, rootNode = document)
	{
		let c = 0;
		let cc = classes.length;
		for (c; c < cc; c += 1)
		{
			rootNode.classList.remove(classes[c]);
			let nodes = rootNode.querySelectorAll("." + classes[c]);
			let n = 0;
			let nn = nodes.length;
			for (n; n < nn; n += 1)
			{
				nodes[n].classList.remove(classes[c]);
			};
		};
	};

	static fitInputSize(sender)
	{
		function measureTextWidth(ofText)
		{
			let result = 0;
			let measureNode = dhtml.createNode("span", "",
				{
					"style": "position:absolute; top:0px; left:0px; display:inline; visibility:visible;"
				}, ofText);
			document.body.appendChild(measureNode);
			result = measureNode.offsetWidth;
			measureNode.remove();
			return result;
		};
		let element = null;
		if (sender.target !== undefined)
		{
			element = sender.target;
		}
		else if (sender.nodeType === 1)
		{
			element = sender;
		};
		if (sender !== null)
		{
			let textToMeasure = element.value;
			if ((textToMeasure === "") && (element.getAttribute("placeholder") !== null))
			{
				textToMeasure = element.getAttribute("placeholder");
			};
			let width = measureTextWidth(textToMeasure) + "px";
			let spaceAfter = element.getAttribute("data-spaceafter");
			if (/[0-9]*.?[0-9]+/.exec(spaceAfter) !== null)
			{
				width = "calc(" + width + " + " + spaceAfter + ")";
			};
			element.style.width = width;
		};
	};

};
