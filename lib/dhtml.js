"use strinct";

class dhtml
{
	static createNode(name, cssClass, attributes, content)
	{
		let domNode = document.createElement(name);
		if (cssClass)
		{
			let cssClasses = cssClass.split(" ");
			for (let c = 0; c < cssClasses.length; c += 1)
			{
				domNode.classList.add(cssClasses[c]);
			};
		};
		for (let attributeKey in attributes)
		{
			domNode.setAttribute(attributeKey, attributes[attributeKey]);
		};
		if (content)
		{
			if (content.constructor === String)
			{
				domNode.innerHTML = content;
			}
			else if (content.constructor === Array)
			{
				for (let i = 0; i < content.length; i += 1)
				{
					domNode.appendChild(content[i]);
				};
			}
			else
			{
				domNode.appendChild(content);
			};
		};
		return domNode;
	};

	static clearNode(domNode)
	{
		while (domNode.firstChild)
		{
			domNode.removeChild(domNode.firstChild);
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
			element.style.width = measureTextWidth(textToMeasure) + "px";
		};
	};

};
