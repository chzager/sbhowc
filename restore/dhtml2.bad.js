"use strict";

class Dhtml2
{
	constructor(xml)
	{
		function _loadSnippets(obj, xml)
		{
			for (let c = 0; c < xml.childNodes.length; c += 1)
			{
				let tagName = xml.childNodes[c].tagName;
				if (tagName !== undefined)
				{
					if (tagName === "dht:snippet")
					{
						obj.snippets[xml.childNodes[c].getAttribute("name")] = xml.childNodes[c];
					};
					_loadSnippets(obj, xml.childNodes[c]);
				};
			};
		};
		this.xml = xml;
		this.snippets = {};
		_loadSnippets(this, this.xml);
	};

	generate(owner, snippetName, variables)
	{
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
				switch (xmlNode.tagName)
				{
				case undefined:
					if (/^\s*$/.test(xml.childNodes[c].textContent) === false)
					{
						ref.innerText += _resolveVariables(xmlNode.textContent, variables);
					};
					break;
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
			};
		};
		let result;
		let snippet = this.snippets[snippetName];
		for (let c = 0; c < snippet.childNodes.length; c += 1)
		{
			if (snippet.childNodes[c].tagName !== undefined)
			{
				snippet = snippet.childNodes[c];
		result = document.createElement(snippet.tagName);
		_addAttributes(result, snippet, variables);
		_appendNodes(this, owner, result, snippet, variables);
				break;
			};
		};
		return result;
	};
};
