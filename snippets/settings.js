"use strict";

/*
This file is part of the ONLINE WARBAND CREATOR (https://github.com/suppenhuhn79/sbhowc)
Copyright 2021 Christoph Zager
Licensed unter the GNU Affero General Public License, Version 3
See the full license text at https://www.gnu.org/licenses/agpl-3.0.en.html
 */

var settingsUi = {};

settingsUi.element = null;

settingsUi.show = function ()
{
	function _setNodeProperty(querySelector, attributeName, value)
	{
		let node = settingsUi.element.querySelector(querySelector);
		if (node !== null)
		{
			node[attributeName] = value;
		};
	};
	settingsUi.element = document.getElementById("settings");
	if (settingsUi.element !== null)
	{
		/* set checks for rules scope */
		for (let rulesScopeCheck of settingsUi.element.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]"))
		{
			let val = rulesScopeCheck.getAttribute("data-settingskey");
			rulesScopeCheck.checked = owc.settings.ruleScope.includes(val);
		};
		/* set language */
		_setNodeProperty("select[data-settingsgroup=\"language\"]", "value", owc.settings.language);
		/* set view mode */
		_setNodeProperty("input[data-settingsgroup=\"view_mode\"][data-settingskey=\"" + owc.settings.viewMode + "\"]", "checked", true);
		/* set options */
		for (let key in owc.settings.options)
		{
			_setNodeProperty("input[data-settingsgroup=\"options\"][data-settingskey=\"" + key + "\"]", "checked", owc.settings.options[key]);
		};
	};
	owc.ui.showBluebox(settingsUi.element);
};

settingsUi.close = () => owc.ui.sweepVolatiles();

settingsUi.applySettings = function ()
{
	function _applyFromGui(targetObj)
	{
		/* get checked rules scope */
		targetObj.ruleScope = [];
		for (let rulesScopeCheck of settingsUi.element.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]"))
		{
			if (rulesScopeCheck.checked)
			{
				let val = rulesScopeCheck.getAttribute("data-settingskey");
				targetObj.ruleScope.push(val);
			};
		};
		/* get language */
		let languageDropDown = settingsUi.element.querySelector("select[data-settingsgroup=\"language\"]");
		targetObj.language = languageDropDown[languageDropDown.selectedIndex].value;
		/* get view mode */
		for (let availibleViewMode of settingsUi.element.querySelectorAll("input[data-settingsgroup=\"view_mode\"]"))
		{
			if (availibleViewMode.checked)
			{
				targetObj.viewMode = availibleViewMode.getAttribute("data-settingskey");
				break;
			};
		};
		/* get options */
		for (let optionsItem of settingsUi.element.querySelectorAll("input[data-settingsgroup=\"options\"]"))
		{
			targetObj.options[optionsItem.getAttribute("data-settingskey")] = optionsItem.checked;
		}
	};
	_applyFromGui(owc.settings);
	settingsUi.close();
	owc.settings.save();
	owc.fetchResources();
	owc.ui.notify("Settings applied.");
};
