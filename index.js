"use strict";

function initDidYouKnow()
{
	didYouKnow.init();
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

function sweepVolatiles()
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
