"use strict";

HTMLElement.prototype.getParentByTagName = function (tagName)
{
	let result = null;
	let parentElement = this.parentElement;
	console.log(this, parentElement);
	if (parentElement !== null)
	{
		if (((parentElement instanceof HTMLElement === true)) && (parentElement.tagName.toLowerCase() === tagName))
		{
			result = parentElement;
		}
		else
		{
			result = parentElement.getParentByTagName(tagName);
		};
	};
	return result;
};

HTMLElement.prototype.removeAllChildred = function ()
{
	while (this.firstChild !== null)
	{
		this.removeChild(this.firstChild);
	};
};
