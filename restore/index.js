"use strict";

function showRestorer()
{
	function _showRestorer()
	{
		restorer.show();
	};
	if (document.getElementById("restorer") === null)
	{
		pageSnippets.import("../snippets/restorer.xml", _showRestorer);
	}
	else
	{
		_showRestorer();
	};
};
