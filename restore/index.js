"use strict";

// let d = new PageSnippets("lsrestore.xml", () => { console.log("Dhlmt callback"); });

function showRestorer()
{
	function _showRestorer()
	{
		if (document.getElementById('restorer') === null)
		{
		document.body.appendChild(PageSnippets.produceFromSnippet("lsrestorer", Restorer));
		};
		showBox(document.getElementById('restorer'), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
	};
	if (typeof lsrestoreMain === "undefined")
	{
		PageSnippets.import("lsrestore.xml", _showRestorer);
	}
	else
	{
		_showRestorer();
	};
};

function showWarbandCode()
{
	function _showWarbandCode()
	{
		showBox(document.getElementById("warbandcode"), String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
		document.querySelector("div#warbandcode textarea").select();
	};
	if (document.getElementById("warbandcode") === null)
	{
		PageSnippets.import("warbandcode.xml", _showWarbandCode);
	}
	else
	{
		_showWarbandCode();
	};
};


function showBox(domElement, topPosition = null, leftPosition = null, blurPage = false)
{
	domElement.style.display = "block";
	domElement.style.visibility = "visible";
	if (leftPosition != null)
	{
		domElement.style.left = leftPosition;
	}
	if (topPosition !== null)
	{
		domElement.style.top = topPosition;
	}
	if (blurPage === true)
	{
		showBox(document.getElementById("blur"));
	}
};

function sweepVolatiles() /* OK */
{
	let volatileSelectors = [".volatile", ".blue"];
	for (let s = 0; s < volatileSelectors.length; s += 1)
	{
		let volatileElements = document.body.querySelectorAll(volatileSelectors[s]);
		for (let e = 0; e < volatileElements.length; e += 1)
		{
			if (volatileElements[e])
			{
				volatileElements[e].style.visibility = "hidden";
			};
		};
	};
};
