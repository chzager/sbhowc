"use strict";

let didyouknow;

Json.load("./res/didyouknow.json", initDidYouKnow);

function initDidYouKnow(url, data)
{
	didyouknow = new DidYouKnow(document.getElementById("didyouknow_text"), data.hints);
};
