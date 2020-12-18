"use strict";

class DidYouKnow
{
	constructor(targetNode, hints)
	{
		this.targetNode = targetNode;
		this.hints = hints;
		this.currentHintIndex = -1;
		this.prefix = "...";
		this.printRandomHint();
	};

	_printHint()
	{
		this.targetNode.innerHTML = this.prefix + this.hints[this.currentHintIndex];
	};

	printRandomHint()
	{
		function randomInteger(max)
		{
			let result = Number(Math.random());
			result = Math.floor(result * max);
			return result;
		};
		this.currentHintIndex = Number(randomInteger(this.hints.length));
		this._printHint();
	};

	printNextHint()
	{
		this.currentHintIndex += 1;
		if (this.currentHintIndex >= this.hints.length)
		{
			this.currentHintIndex = 0;
		};
		this._printHint();
	}
};
