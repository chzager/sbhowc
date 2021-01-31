"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var settingsUi = {};

settingsUi.show = function ()
{
	if (document.getElementById("settings") === null)
	{
		document.body.appendChild(pageSnippets.produce("settings", settingsUi));
	};
	let settingsPanel = document.getElementById("settings");
	/* set checks for rules scope */
	for (let rulesScopeCheck of settingsPanel.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]"))
	{
		let val = rulesScopeCheck.getAttribute("data-settingskey");
		rulesScopeCheck.checked = owc.settings.ruleScope.includes(val);
	};
	/* set language */
	settingsPanel.querySelector("select[data-settingsgroup=\"language\"]").value = owc.settings.language;
	/* set view mode */
	settingsPanel.querySelector("input[data-settingsgroup=\"view_mode\"][data-settingskey=\"" + owc.settings.viewMode + "\"]").checked = true;
	/* set options */
	for (let key in owc.settings.options)
	{
		settingsPanel.querySelector("input[data-settingsgroup=\"options\"][data-settingskey=\"" + key + "\"]").checked = owc.settings.options[key];
	};
	owc.ui.showElement(settingsPanel, String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 10)) + "px", null, true);
};

settingsUi.applySettings = function ()
{
	function _applyFromGui(targetObj)
	{
		let settingsPanel = document.getElementById("settings");
		/* get checked rules scope */
		targetObj.ruleScope = [];
		for (let rulesScopeCheck of settingsPanel.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]"))
		{
			if (rulesScopeCheck.checked === true)
			{
				let val = rulesScopeCheck.getAttribute("data-settingskey");
				targetObj.ruleScope.push(val);
			};
		};
		/* get language */
		let languageDropDown = settingsPanel.querySelector("select[data-settingsgroup=\"language\"]");
		targetObj.language = languageDropDown[languageDropDown.selectedIndex].value;
		/* get view mode */
		for (let availibleViewMode of settingsPanel.querySelectorAll("input[data-settingsgroup=\"view_mode\"]"))
		{
			if (availibleViewMode.checked === true)
			{
				targetObj.viewMode = availibleViewMode.getAttribute("data-settingskey");
				break;
			};
		};
		/* get options */
		for (let optionsItem of settingsPanel.querySelectorAll("input[data-settingsgroup=\"options\"]"))
		{
			targetObj.options[optionsItem.getAttribute("data-settingskey")] = optionsItem.checked;
		}
	};
	_applyFromGui(owc.settings);
	owc.ui.sweepVolatiles();
	owc.settings.save();
	owc.fetchResources();
};
