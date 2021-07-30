"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var settingsUi = {
	element: null,
};

settingsUi.show = function ()
{
	settingsUi.element = document.getElementById("settings");
	if (settingsUi.element !== null)
	{
		/* set checks for rules scope */
		for (let rulesScopeCheck of settingsUi.element.querySelectorAll("input[data-group=\"rules_scope\"]"))
		{
			rulesScopeCheck.checked = owc.settings.ruleScope.includes(rulesScopeCheck.getAttribute("data-group-value"));
		};
		/* set view mode */
		settingsUi.element.querySelector("input[data-group=\"view_mode\"][data-group-value=\"" + owc.settings.viewMode + "\"]").checked = true;
		/* set auto mapped elements */
		htmlBuilder.dataToElements(owc.settings, settingsUi.element);
	};
	owc.ui.showBluebox(settingsUi.element);
};

settingsUi.close = () => owc.ui.sweepVolatiles();

settingsUi.applySettings = function ()
{
	let uiValues = {};
	uiValues.ruleScope = [];
	for (let rulesScopeCheck of settingsUi.element.querySelectorAll("input[data-group=\"rules_scope\"]:checked"))
	{
		uiValues.ruleScope.push(rulesScopeCheck.getAttribute("data-group-value"));
	};
	/* get view mode */
	uiValues.viewMode = settingsUi.element.querySelector("input[data-group=\"view_mode\"]:checked").getAttribute("data-group-value");
	/* get auto mapped elements */
	htmlBuilder.dataFromElements(uiValues, settingsUi.element);
	/* assign and apply */
	owc.settings = Object.assign(owc.settings, uiValues);
	settingsUi.close();
	owc.settings.save();
	owc.fetchResources();
	owc.ui.notify("Settings applied.");
};
