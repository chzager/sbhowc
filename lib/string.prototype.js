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

String.prototype.replaceAll = function(regEx, replaceValue)
{
	let result = this;
	let rexMatch = regEx.exec(result);
	while (rexMatch !== null)
	{
		result = result.replace(rexMatch[0], replaceValue);
		rexMatch = regEx.exec(result);
	};
	return result;
};
