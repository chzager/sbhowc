"use strict";

var didYouKnow = {};

didYouKnow.init = function ()
{
	fileIo.fetchServerFile("./res/didyouknow.json", (url, data) =>
	{
		didYouKnow.hints = data.hints;
		didYouKnow.currentHintIndex = -1;
		didYouKnow.printRandomHint();
	}
	);
};

didYouKnow.printRandomHint = function ()
{
	function randomInteger(max)
	{
		let result = Number(Math.random());
		result = Math.floor(result * max);
		return result;
	};
	didYouKnow.currentHintIndex = Number(randomInteger(didYouKnow.hints.length));
	document.getElementById("didyouknow_text").innerHTML = didYouKnow.hints[didYouKnow.currentHintIndex];
};

didYouKnow.printNextHint = function ()
{
	didYouKnow.currentHintIndex += 1;
	if (didYouKnow.currentHintIndex >= didYouKnow.hints.length)
	{
		didYouKnow.currentHintIndex = 0;
	};
	document.getElementById("didyouknow_text").innerHTML = didYouKnow.hints[didYouKnow.currentHintIndex];
};
