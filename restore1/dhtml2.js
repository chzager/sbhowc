"use strict";

class Dhtml2
{
	constructor(xml)
	{
		function _loadSnippets(obj)
		{
			let snippetCollection = obj.xml.getElementsByTagName("dht:snippet");
			for (let s = 0; s < snippetCollection.length; s += 1)
			{
				obj.snippets[snippetCollection[s].getAttribute("name")] = snippetCollection[s].firstElementChild;
			};
		};
		function _loadIncludes(obj)
		{
			let includesCollection = obj.xml.getElementsByTagName("dht:include");
			for (let s = 0; s < includesCollection.length; s += 1)
			{
				switch (includesCollection[s].getAttribute("type"))
				{
				case "stylesheet":
					let styleNode = document.createElement("link");
					styleNode.setAttribute("rel", "stylesheet");
					styleNode.setAttribute("href", includesCollection[s].getAttribute("src"));
					document.head.appendChild(styleNode);
					// document.head.insertBefore(styleNode, document.head.firstElementChild);
					console.log(styleNode);
					break;
				case "script":
					let scriptNode = document.createElement("script");
					// scriptNode.setAttribute("async", "false");
					scriptNode.setAttribute("src", includesCollection[s].getAttribute("src"));
					scriptNode.addEventListener("load", () => { console.log("loaded"); }, false);
					document.head.appendChild(scriptNode);
					console.log(scriptNode);
					break;
				};
			};
		};
		this.xml = xml;
		this.snippets = {};
		_loadSnippets(this);
		_loadIncludes(this);
	};

	generate(owner, snippetName, variables)
	{
		const nodeType =
		{
			"element": 1,
			"text": 3
		};
		function _resolveVariables(text, variables)
		{
			let rex = /\{{2}(\S+)\}{2}/g;
			let result = text;
			let rexResult = rex.exec(text);
			while (rexResult !== null)
			{
				if (typeof variables[rexResult[1]] !== "undefined")
				{
					result = result.replace("{{" + rexResult[1] + "}}", variables[rexResult[1]]);
				};
				rexResult = rex.exec(text);
			};
			return result;
		};
		function _addAttributes(node, xmlOrigin, variables)
		{
			for (let a = 0; a < xmlOrigin.attributes.length; a += 1)
			{
				node.setAttribute(xmlOrigin.attributes[a].name, _resolveVariables(xmlOrigin.attributes[a].value, variables));
			};
		};
		function _appendNodes(obj, owner, ref, xml, variables)
		{
			for (let c = 0; c < xml.childNodes.length; c += 1)
			{
				let xmlNode = xml.childNodes[c];
				switch (xmlNode.nodeType)
				{
				case nodeType.element:
					switch (xmlNode.tagName)
					{
					case "dht:call-function":
						owner[xmlNode.getAttribute("name")](ref);
						break;
					case "dht:insert-snippet":
						ref.appendChild(obj.generate(owner, xmlNode.getAttribute("name"), variables));
						break;
					default:
						let child = document.createElement(xmlNode.tagName);
						_addAttributes(child, xmlNode, variables);
						_appendNodes(obj, owner, child, xml.childNodes[c], variables);
						ref.appendChild(child);
					};
					break;
				case nodeType.text:
					if (/^\s*$/.test(xmlNode.textContent) === false)
					{
						ref.appendChild(document.createTextNode(_resolveVariables(xmlNode.textContent, variables)));
					};
					break;
				};
			};
		};
		let result;
		let snippet = this.snippets[snippetName];
		result = document.createElement(snippet.tagName);
		_addAttributes(result, snippet, variables);
		_appendNodes(this, owner, result, snippet, variables);
		return result;
	};
};
