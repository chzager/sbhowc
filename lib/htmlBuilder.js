"use strinct";

let htmlBuilder = {};

htmlBuilder.removeNodesByQuerySelectors = function(querySelectors, rootNode = document)
{
	for (let s = 0, ss = querySelectors.length; s < ss; s += 1)
	{
		let nodes = rootNode.querySelectorAll(querySelectors[s]);
		for (let n = 0, nn = nodes.length; n < nn; n += 1)
		{
			nodes[n].remove();
		};
	};
};

htmlBuilder.removeClasses= function(classes, rootNode = document)
{
	for (let c = 0, cc = classes.length; c < cc; c += 1)
	{
		rootNode.classList.remove(classes[c]);
		let nodes = rootNode.querySelectorAll("." + classes[c]);
		for (let n = 0, nn = nodes.length; n < nn; n += 1)
		{
			nodes[n].classList.remove(classes[c]);
		};
	};
};
