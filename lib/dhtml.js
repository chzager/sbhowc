"use strinct";

class dhtml
{
	static createNode(name, cssClass, attributes, content)
	{
		// console.log("createNode:", name, cssClass, attributes, content);
		let domNode = document.createElement(name);
		if (cssClass)
		{
			let cssClasses = cssClass.split(" ");
			for (let c = 0; c < cssClasses.length; c += 1)
			{
				domNode.classList.add(cssClasses[c]);
			}
		}
		for (let attributeKey in attributes)
		{
			domNode.setAttribute(attributeKey, attributes[attributeKey]);
		}
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
				}
			}
			else
			{
				domNode.appendChild(content);
			}
		}
		return domNode;
	}

	static clearNode(domNode)
	{
		while (domNode.firstChild)
		{
			domNode.removeChild(domNode.firstChild);
		}
	}

	static measureTextWidth(ofText)
	{
		let widthMeasureNode = dhtml.createNode("span", "", {"style": "position:absolute; top:0px; left:0px; display:inline; visibility:hidden;"}, ofText);
		document.body.appendChild(widthMeasureNode);
		let measuredWidth = widthMeasureNode.offsetWidth;
		widthMeasureNode.remove();
		return measuredWidth;
	}

	static fitInputSize(evt, minWidthPx)
	{
		//console.log(new Error().stack);
		// Note = evt might be a DomNode (<input>) as well
		if (minWidthPx === undefined)
		{
			minWidthPx = 0;
		}
		if (evt.target)
		{
			evt.target.style.width = Math.max(dhtml.measureTextWidth(evt.target.value) + 3, minWidthPx).toString() + "px";
		}
		else if (evt.style)
		{
			evt.style.width = Math.max(dhtml.measureTextWidth(evt.value) + 3, minWidthPx).toString() + "px";
		}
	}

}
