"use strict";

String.prototype.notEmpty = function(valueIfEmpty)
{
	let result = this;
	if (this.length === 0)
	{
		result = valueIfEmpty;
	};
	return result;
};
