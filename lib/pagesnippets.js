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
				if (snippetCollection[s].childElementCount > 1)
				{
					console.warn("Importing pageSnippets from \"" + url + "\": a snippet must have only one child element.", snippetCollection[s]);
				};
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
				let scriptRef = loadEvent.target.getAttribute("src");
				let functionName = scriptEvents[scriptRef];
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
			let newScriptsCount = 0;
			for (let s = 0; s < scriptsCollection.length; s += 1)
			{
				let src = _cleanPath(templateRoot.concat(scriptsCollection[s].getAttribute("src")));
				if (document.querySelector("script[src=\"" + src + "\"]") === null)
				{
					newScriptsCount += 1;
					let scriptNode = document.createElement("script");
					scriptNode.setAttribute("src", src);
					scriptEvents[src] = scriptsCollection[s].getAttribute("onloadend");
					scriptNode.addEventListener("load", __onScriptLoadend, false);
					document.head.appendChild(scriptNode);
				}
				else
				{
					scriptsToLoad -= 1;
				};
			};
			if ((scriptsCollection.length === 0) || (newScriptsCount === 0))
			{
				callback();
			};
		};
		let scriptsToLoad = xmlDocument.getElementsByTagName("dht:script").length;
		console.debug("pageSnippets imported from \"" + url + "\"");
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
				if (owner[attr.value] !== undefined)
				{
					node[rexMatch[1]] = owner[attr.value].bind(owner);
				}
				else
				{
					console.error("\"" + attr.value + "\" is not a function of owner object", sourceXml);
				};
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
					let functionName = xmlNode.getAttribute("name");
					if (functionName !== null)
					{
						if (typeof owner[functionName] === "function")
						{
							owner[functionName](node);
						}
						else
						{
							console.error("\"" + functionName + "\" is not a function of owner object", xmlNode, owner);
						};
					};
					break;
				case "dht:for-each":
					_forEach(node, xmlNode, owner, variables);
					break;
				case "dht:if":
					let testExpression = _resolveVariables(xmlNode.getAttribute("test"), variables);
					// console.debug("eval", testExpression, "=", eval(testExpression), variables);
					if (eval(testExpression) === true)
					{
						let thenNode = xmlNode.getElementsByTagName("dht:then")[0];
						_appendNodes(node, thenNode, owner, variables);
					}
					else
					{
						let elseNode = xmlNode.getElementsByTagName("dht:else");
						if (elseNode.length === 1)
						{
							_appendNodes(node, elseNode[0], owner, variables);
						};
					};
					break;
				case "dht:insert-snippet":
					node.appendChild(pageSnippets.produceFromSnippet(xmlNode.getAttribute("name"), owner, variables));
					break;
				default:
					let child = document.createElement(xmlNode.tagName);
					_addAttributes(child, xmlNode, owner, variables);
					_appendNodes(child, xmlNode, owner, variables);
					_execPostRender(child, xmlNode, owner);
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
	function _execPostRender(refNode, xmlNode, owner)
	{
		let postrenderFunction = xmlNode.getAttribute("dht:postrender");
		if (postrenderFunction !== null)
		{
			if (typeof owner[postrenderFunction] === "function")
			{
				owner[postrenderFunction](refNode);
			}
			else
			{
				console.error("\"" + postrenderFunction + "\" is not a function of owner object", xmlNode, owner);
			};
		};
	};
	function _forEach(refNode, xmlNode, owner, variables)
	{
		let listKey = xmlNode.getAttribute("list");
		// console.debug("_forEach()", refNode.outerHTML, xmlNode, xmlNode.firstElementChild, variables[listKey]);
		for (let i = 0; i < variables[listKey].length; i += 1)
		{
			_appendNodes(refNode, xmlNode, owner, variables[listKey][i]);
		};
	};
	if (pageSnippets.snippets[snippetName] === undefined)
	{
		throw new ReferenceError("Unknown snippet \"" + snippetName + "\"");
	}
	else
	{
		let snippet = pageSnippets.snippets[snippetName];
		let result = document.createElement(snippet.tagName);
		// console.group(snippetName);
		// console.log(snippet.outerHTML);
		_addAttributes(result, snippet, owner, variables);
		_appendNodes(result, snippet, owner, variables);
		_execPostRender(result, snippet, owner);
		// console.log(result.outerHTML);
		// console.groupEnd();
		return result;
	};
};
