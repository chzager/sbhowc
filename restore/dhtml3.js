"use strict";

class Dhtml2
{
	static includeScript(url, callback)
	{
		if (document.querySelector("script[src=\"" + url + "\"]") === null)
		{
			let scriptNode = document.createElement("script");
			scriptNode.setAttribute("src", url);
			scriptNode.addEventListener("load", callback, false);
			document.head.appendChild(scriptNode);
		}
		else if (callback !== undefined)
		{
			callback();
		};
	};

	constructor(templateUrl, callback)
	{
		let obj = this;
		let xmlDocument;
		this.snippets = {};
		function _templateLoaded(url, data)
		{
			xmlDocument = data;
			let stylesheet = data.children[0].getAttribute("stylesheet");
			if (stylesheet !== null)
			{
				let styleNode = document.createElement("link");
				styleNode.setAttribute("rel", "stylesheet");
				styleNode.setAttribute("href", stylesheet);
				document.head.appendChild(styleNode);
			};
			_collectSinppets(obj);
			callback(obj)
		};
		function _collectSinppets(refObj)
		{
			let snippetCollection = xmlDocument.getElementsByTagName("dht:snippet");
			for (let s = 0; s < snippetCollection.length; s += 1)
			{
				refObj.snippets[snippetCollection[s].getAttribute("name")] = snippetCollection[s].firstElementChild;
			};
		};
		FileIo.fetchServerFile(templateUrl, _templateLoaded);
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
		function _addAttributes(owner, node, xmlOrigin, variables)
		{
			for (let a = 0; a < xmlOrigin.attributes.length; a += 1)
			{
				let attr = xmlOrigin.attributes[a];
				let rexMatch = /^dht:(on[\w]+)/.exec(attr.name);
				if (rexMatch !== null)
				{
					node[rexMatch[1]] = owner[attr.value];
				}
				else
				{
					node.setAttribute(attr.name, _resolveVariables(attr.value, variables));
				};
			};
		};
		function _appendNodes(refObj, owner, ref, xml, variables)
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
						ref.appendChild(refObj.generate(owner, xmlNode.getAttribute("name"), variables));
						break;
					default:
						let child = document.createElement(xmlNode.tagName);
						_addAttributes(owner, child, xmlNode, variables);
						_appendNodes(refObj, owner, child, xml.childNodes[c], variables);
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
		_addAttributes(owner, result, snippet, variables);
		_appendNodes(this, owner, result, snippet, variables);
		return result;
	};
};
