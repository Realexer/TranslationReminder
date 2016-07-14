var OptionsPage = function ()
{
	var _this = this;
	
	var sitesInitialValues = "";

	var sitesBlackListTextArea = getEl("TR-SitesBlackList");
	var enableAutoTranslateCheckbox = getEl("TR-EnableAutoTranslate");
	var languageSelect = getEl("TR-TranslationLanguage");
	var savingStatusLabel = getEl("TR-SavingLabel");

	this.init = function ()
	{
		
		Register.settingsManager.GetSitesBlackList(function (sites)
		{
			sitesInitialValues = sites.join("; ");
			UIManager.setValue(sitesBlackListTextArea, sitesInitialValues);
		});
		
		Register.settingsManager.IsAutotranslationEnabled(function (result)
		{
			UIManager.setChecked(enableAutoTranslateCheckbox, result);
		});
		
		UIManager.addEvent(sitesBlackListTextArea, "keydown", function(e) 
		{
			if (event.keyCode === 13 && event.ctrlKey) // enter
			{
				e.preventDefault();
				Register.settingsManager.UpdateSitesBlackList(sitesBlackListTextArea.value.split(";"), function ()
				{
					tellSaved();
				});
			}
		});
		
		UIManager.addEvent(sitesBlackListTextArea, "input", function() 
		{
			if (UIManager.getValue(sitesBlackListTextArea) != sitesInitialValues)
			{
				tellNotSaved();
			}
			else
			{
				tellNothingToSave();
			}
		});
		
		UIManager.addEvent(enableAutoTranslateCheckbox, "change", function() 
		{
			Register.settingsManager.setAutoTranslationEnabled(enableAutoTranslateCheckbox.checked, 
			function () { 
				tellSaved(); 
			});
		});
		
		UIManager.addEvent(languageSelect, "change", function() 
		{
			Register.settingsManager.SetTranslationLanguage(languageSelect.value, function () { tellSaved(); });
		})

		new BingClient().GetSupportedLangs(function (langs)
		{
			Register.settingsManager.GetTranslationLanguage(function (lang)
			{
				langs.sort();
				for (var i = 0; i < langs.length; i++)
				{
					var option = document.createElement("option");
					option.setAttribute("value", langs[i]);
					option.selected = lang == langs[i];
					option.innerHTML = langs[i];
					languageSelect.appendChild(option);
				}
			});
		});
	};


	function tellSaved()
	{
		UIManager.setClass(savingStatusLabel, "TR-Green");
		
		// hack for making animation run again. We first (re) apply not animated class and then run animated (again)
		Threader.putInQueue(function() {
			UIManager.setHTML(savingStatusLabel, "Saved");
			UIManager.setClass(savingStatusLabel, "TR-Green TR-Saved")
			UIManager.showEl(savingStatusLabel);
		});

	};

	function tellNotSaved()
	{
		UIManager.setHTML(savingStatusLabel, "Not saved");
		UIManager.setClass(savingStatusLabel, "TR-Red")
		UIManager.showEl(savingStatusLabel);
	};

	function tellNothingToSave()
	{
		UIManager.hideEl(savingStatusLabel);
	};
};

window.onload = function ()
{
	Register.optionsPage = new OptionsPage();
	Register.optionsPage.init();
};