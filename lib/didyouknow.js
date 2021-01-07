"use strict";

class DidYouKnow
{
	constructor(presentationNode, didYouKnows = null)
	{
		this.presentationNode = presentationNode;
		this.hints = didYouKnows;
		this.currentHintIndex = -1;
	};

	printRandomHint()
	{
		this.currentHintIndex = Math.floor(Math.random() * (this.hints.length));
		this.presentationNode.innerHTML = this.hints[this.currentHintIndex];
	};

	printNextHint()
	{
		this.currentHintIndex += 1;
		if (this.currentHintIndex >= this.hints.length)
		{
			this.currentHintIndex = 0;
		};
		this.presentationNode.innerHTML = this.hints[this.currentHintIndex];
	};
};
