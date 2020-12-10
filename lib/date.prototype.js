"use strict";

Date.prototype.fromIsoString = function(isoString)
{
	let datePart = isoString.split(/\D+/);
	this.setUTCFullYear(datePart[0]);
	this.setUTCMonth(datePart[1] -1);
	this.setUTCDate(datePart[2]);
	this.setUTCHours(datePart[3]);
	this.setUTCMinutes(datePart[4]);
	this.setUTCSeconds(datePart[5]);
	this.setUTCMilliseconds(datePart[6]);
	return this;
};
