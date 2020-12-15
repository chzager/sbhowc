"use strict";

class Dhtml2
{

	constructor(templateUrl, callback)
	{
		let obj = this;
		let xmlDocument;
		let scriptsToLoad = 0;

		this.snippets = {};
		function _templateLoaded(url, data)
		{
			xmlDocument = data;
			scriptsToLoad = xmlDocument.getElementsByTagName("dht:script").length;
			_collectSinppets();
			_includeStylesheets();
			_includeScripts();
			// callback(obj)
		};
		function _collectSinppets()
		{
			let snippetCollection = xmlDocument.getElementsByTagName("dht:snippet");
			for (let s = 0; s < snippetCollection.length; s += 1)
			{
				obj.snippets[snippetCollection[s].getAttribute("name")] = snippetCollection[s].firstElementChild;
			};
		};
		function _includeStylesheets()
		{
			let stylesheetsCollection = xmlDocument.getElementsByTagName("dht:stylesheet");
			for (let s = 0; s < stylesheetsCollection.length; s += 1)
			{
					let styleNode = document.createElement("link");
					styleNode.setAttribute("rel", "stylesheet");
					styleNode.setAttribute("href", stylesheetsCollection[s].getAttribute("src"));
					document.head.appendChild(styleNode);
			};
		};
		function _includeScripts()
		{
			let scriptEvents = {};
			function __onScriptLoadend(loadEvent)
			{
				let srciptRef = loadEvent.target.getAttribute("src");
				let functionName = scriptEvents[srciptRef];
				if (functionName !== null)
				{
					window[functionName](obj);
				};
			};
			let scriptsCollection = xmlDocument.getElementsByTagName("dht:script");
			for (let s = 0; s < scriptsCollection.length; s += 1)
			{
				scriptsToLoad -= 1;
				let src = scriptsCollection[s].getAttribute("src");
				if (document.querySelector("script[src=\"" + src + "\"]") === null)
				{
					let scriptNode = document.createElement("script");
					scriptNode.setAttribute("async", "false");
					scriptNode.setAttribute("src", src);
					scriptEvents[scriptsCollection[s].getAttribute("src")] = scriptsCollection[s].getAttribute("onloadend");
					scriptNode.addEventListener("load", __onScriptLoadend, false);
					document.head.appendChild(scriptNode);
				};
			};
		};
		FileIo.fetchServerFile(templateUrl, _templateLoaded);
	};

	eventDispatcher(...a)
	{
		console.log("eventDispatcher", a);
	};
	
	generate(agent, snippetName, variables)
	{
		const nodeType =
		{
			"element": 1,
			"text": 3
		};
		let obj = this;
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
		function _addAttributes(agent, node, xmlOrigin, variables)
		{
			for (let a = 0; a < xmlOrigin.attributes.length; a += 1)
			{
				let attr = xmlOrigin.attributes[a];
				let rexMatch = /^dht:(on[\w]+)/.exec(attr.name);
				if (rexMatch !== null)
				{
					// node[rexMatch[1]] = this.eventDispatcher; //agent[attr.value];
					// node[rexMatch[1]] = (evt) => { obj.eventDispatcher(evt, obj, agent, attr); }; //agent[attr.value];
					node[rexMatch[1]] = (evt) => { agent[attr.value](evt, obj); }; //agent[attr.value];
				}
				else
				{
					node.setAttribute(attr.name, _resolveVariables(attr.value, variables));
				};
			};
		};
		function _appendNodes(refObj, agent, ref, xml, variables)
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
						agent[xmlNode.getAttribute("name")](ref);
						break;
					case "dht:insert-snippet":
						ref.appendChild(refObj.generate(agent, xmlNode.getAttribute("name"), variables));
						break;
					default:
						let child = document.createElement(xmlNode.tagName);
						_addAttributes(agent, child, xmlNode, variables);
						_appendNodes(refObj, agent, child, xml.childNodes[c], variables);
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
		_addAttributes(agent, result, snippet, variables);
		_appendNodes(this, agent, result, snippet, variables);
		return result;
	};
};
