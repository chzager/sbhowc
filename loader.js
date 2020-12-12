"use strict";

function generateNewPid()
{
	let result = "";
	for (let c = 0; c < 6; c += 1)
	{
		let r = Math.floor(Math.random() * 36);
		if (r < 10)
		{
			r += 48;
		}
		else
		{
			r += 97 - 10;
		};
		result += String.fromCharCode(r);
	};
	/* make sure PID contains at least one number */
	if (/[0-9]/.test(result) === false)
	{
		result = generateNewPid();
	};
	return result;
};

let pid = window.location.getParam(urlParam.pid);
if (pid === "")
{
	console.debug("no pid");
	let pidParam = {};
	let pid = generateNewPid();
	pidParam[urlParam.pid] = generateNewPid();
	let warbandCodeUrl = window.location.getParam(urlParam.warband);
	console.debug("warbandCodeUrl", warbandCodeUrl);
	if (warbandCodeUrl !== "")
	{
		storage.store(pid, "", warbandCodeUrl);
		console.debug("warband from URL stored");
	};
	location.setParams(pidParam);
	console.debug("reloading");
}
else
{
	initResources(resources, settings);
};
