"use strict";

Array.prototype.remove = function(index)
{
	this.splice(index, 1);
};

Array.prototype.swap = function(indexA, indexB)
{
	let tmp = this[indexA];
	this[indexA] = this[indexB];
	this[indexB] = tmp;
};
