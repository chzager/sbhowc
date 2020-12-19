"use strict";

var pageSnippets = {};

pageSnippets.snippets = {};

pageSnippets.import = function (templateUrl, callback = null)
{
	let templateRoot = "";
	function _cleanPath(path)
	{
		let result = path.replaceAll(/[^/]+\/\.\.\//g, "");
		return result;
	};
	function _templateLoaded(url, xmlDocument)
	{
		function _collectSinppets()
		{
			let snippetCollection = xmlDocument.getElementsByTagName("dht:snippet");
			for (let s = 0; s < snippetCollection.length; s += 1)
			{
				pageSnippets.snippets[snippetCollection[s].getAttribute("name")] = snippetCollection[s].firstElementChild;
			};
		};
		function _includeStylesheets()
		{
			let stylesheetsCollection = xmlDocument.getElementsByTagName("dht:stylesheet");
			for (let s = 0; s < stylesheetsCollection.length; s += 1)
			{
				let styleNode = document.createElement("link");
				let src = _cleanPath(templateRoot.concat(stylesheetsCollection[s].getAttribute("src")));
				if (document.querySelector("link[rel=\"stylesheet\"][href=\"" + src + "\"]") === null)
				{
					styleNode.setAttribute("rel", "stylesheet");
					styleNode.setAttribute("href", src);
					document.head.appendChild(styleNode);
				};
			};
		};
		function _includeScripts()
		{
			let scriptEvents = {};
			function __onScriptLoadend(loadEvent)
			{
				scriptsToLoad -= 1;
				let srciptRef = loadEvent.target.getAttribute("src");
				let functionName = scriptEvents[srciptRef];
				if (functionName !== null)
				{
					window[functionName]();
				};
				if ((scriptsToLoad === 0) && (callback !== null))
				{
					callback();
				};
			};
			let scriptsCollection = xmlDocument.getElementsByTagName("dht:script");
			for (let s = 0; s < scriptsCollection.length; s += 1)
			{
				let src = _cleanPath(templateRoot.concat(scriptsCollection[s].getAttribute("src")));
				if (document.querySelector("script[src=\"" + src + "\"]") === null)
				{
					let scriptNode = document.createElement("script");
					scriptNode.setAttribute("src", src);
					scriptEvents[src] = scriptsCollection[s].getAttribute("onloadend");
					scriptNode.addEventListener("load", __onScriptLoadend, false);
					document.head.appendChild(scriptNode);
				};
			};
		};
		let scriptsToLoad = xmlDocument.getElementsByTagName("dht:script").length;
		_collectSinppets();
		_includeStylesheets();
		_includeScripts();
	};
	templateRoot = templateUrl.replace(/[^./]+\.[\S]+$/, "");
	fileIo.fetchServerFile(templateUrl, _templateLoaded);
};

pageSnippets.produceFromSnippet = function (snippetName, owner = window, variables = {}
)
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
	function _addAttributes(node, sourceXml, owner, variables)
	{
		for (let a = 0; a < sourceXml.attributes.length; a += 1)
		{
			let attr = sourceXml.attributes[a];
			let rexMatch = /^dht:(on[\w]+)/.exec(attr.name);
			if (rexMatch !== null)
			{
				node[rexMatch[1]] = owner[attr.value].bind(owner);
			}
			else
			{
				node.setAttribute(attr.name, _resolveVariables(attr.value, variables));
			};
		};
	};
	function _appendNodes(node, sourceXml, owner, variables)
	{
		for (let c = 0; c < sourceXml.childNodes.length; c += 1)
		{
			let xmlNode = sourceXml.childNodes[c];
			switch (xmlNode.nodeType)
			{
			case nodeType.element:
				switch (xmlNode.tagName)
				{
				case "dht:call-function":
					owner[xmlNode.getAttribute("name")](node);
					break;
				case "dht:insert-snippet":
					node.appendChild(pageSnippets.produceFromSnippet(xmlNode.getAttribute("name"), owner, variables));
					break;
				default:
					let child = document.createElement(xmlNode.tagName);
					_addAttributes(child, xmlNode, owner, variables);
					_appendNodes(child, sourceXml.childNodes[c], owner, variables);
					node.appendChild(child);
				};
				break;
			case nodeType.text:
				if (/^\s*$/.test(xmlNode.textContent) === false)
				{
					node.appendChild(document.createTextNode(_resolveVariables(xmlNode.textContent, variables)));
				};
				break;
			};
		};
	};
	let snippet = pageSnippets.snippets[snippetName];
	let result = document.createElement(snippet.tagName);
	_addAttributes(result, snippet, owner, variables);
	_appendNodes(result, snippet, owner, variables);
	return result;
};
