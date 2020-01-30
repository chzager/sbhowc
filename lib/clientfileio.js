"use strict";

class ClientFile
{
	constructor()
	{
		throw new TypeError("Illegal constructor.");
	};
	
	static write(filename, data)
	{
		let anchorNode = document.createElement("a");
		anchorNode.style.display = "none";
		let file = new Blob([data],
			{
				type: "text/plain"
			}
			);
		anchorNode.href = URL.createObjectURL(file);
		anchorNode.download = String(filename).replace(/[^a-z0-9\s\-_.]/ig, "");
		document.body.appendChild(anchorNode);
		anchorNode.click();
		anchorNode.remove();
	};
	
	static readPrompt(clickEvent, onReadFunction)
	{
		let inputNode = document.createElement("input");
		inputNode.setAttribute("type", "file");
		inputNode.setAttribute("accept", "text/plain");
		inputNode.style.display = "none";
		inputNode.onchange = function (fileEvent)
		{
			let fileReader = new FileReader();
			fileReader.onload = onReadFunction;
			fileReader.readAsText(fileEvent.target.files[0]);
		};
		document.body.appendChild(inputNode);
		inputNode.click();
		inputNode.remove();
	};
	
};
