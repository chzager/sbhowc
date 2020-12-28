"use strict";

HTMLElement.prototype.removeAllChildren = function ()
{
	while (this.firstChild !== null)
	{
		this.removeChild(this.firstChild);
	};
};
