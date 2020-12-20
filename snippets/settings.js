"use strict";

var settingsUi = {};

settingsUi.show = function ()
{
	if (document.getElementById("settings") === null)
	{
		document.body.appendChild(pageSnippets.produceFromSnippet("settings", settingsUi));
	};
	let settingsPanel = document.getElementById("settings");
	/* set checks for rules scope */
	let rulesScopeChecks = settingsPanel.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]");
	for (let i = 0; i < rulesScopeChecks.length; i += 1)
	{
		let val = rulesScopeChecks[i].getAttribute("data-settingskey");
		rulesScopeChecks[i].checked = owc.settings.ruleScope.includes(val);
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
	ui.showBox(settingsPanel, String(Math.floor(document.documentElement.scrollTop + document.body.clientHeight / 15)) + "px", null, true);
};

settingsUi.applySettings=function()
{
	function _applyFromGui(targetObj)
	{
		let settingsPanel = document.getElementById("settings");
		/* get checked rules scope */
		let rulesScopeChecks = settingsPanel.querySelectorAll("input[data-settingsgroup=\"rules_scope\"]");
		targetObj.ruleScope = [];
		for (let i = 0; i < rulesScopeChecks.length; i += 1)
		{
			if (rulesScopeChecks[i].checked === true)
			{
				let val = rulesScopeChecks[i].getAttribute("data-settingskey");
				targetObj.ruleScope.push(val);
			};
		};
		/* get language */
		let languageDropDown = settingsPanel.querySelector("select[data-settingsgroup=\"language\"]");
		targetObj.language = languageDropDown[languageDropDown.selectedIndex].value;
		/* get view mode */
		let availibleViewModes = settingsPanel.querySelectorAll("input[data-settingsgroup=\"view_mode\"]");
		for (let i = 0; i < availibleViewModes.length; i += 1)
		{
			if (availibleViewModes[i].checked === true)
			{
				targetObj.viewMode = availibleViewModes[i].getAttribute("data-settingskey");
				break;
			};
		};
		/* get options */
		let optionItems = settingsPanel.querySelectorAll("input[data-settingsgroup=\"options\"]");
		for (let i = 0; i < optionItems.length; i += 1)
		{
			let optionsItem = optionItems[i];
			targetObj.options[optionsItem.getAttribute("data-settingskey")] = optionsItem.checked;
		}
	};
	_applyFromGui(owc.settings);
	ui.sweepVolatiles();
	owc.settings.save();
	owc.fetchResources();
};
