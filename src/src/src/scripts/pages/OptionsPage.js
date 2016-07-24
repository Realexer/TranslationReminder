var OptionsPage = function ()
{
	var _this = this;
	
	var sitesInitialValues = "";

	var settingsForm = getEl("TR-SettingsForm");
	var sitesBlackListTextArea = getEl("TR-SitesBlackList");
	var enableAutoTranslateCheckbox = getEl("TR-EnableAutoTranslate");
	var languageSelect = getEl("TR-TranslationLanguage");
	var savingStatusLabel = getEl("TR-SavingLabel");

	this.init = function ()
	{
		
//		Register.settingsManager.GetSitesBlackList(function (sites)
//		{
//			sitesInitialValues = sites.join("; ");
//			UIManager.setValue(sitesBlackListTextArea, sitesInitialValues);
//		});
//		
//		Register.settingsManager.IsAutotranslationEnabled(function (result)
//		{
//			UIManager.setChecked(enableAutoTranslateCheckbox, result);
//		});
		
		UIManager.addEventNoDefault(settingsForm, "submit", function(e) 
		{
			var formData = new FormData(settingsForm);
			var settings = {};
			settings[SettingsKeys.SitesBlackList] = formData.get(SettingsKeys.SitesBlackList).split(";").TrimAllElements().RemoveDuplicates().filter(function(item) {
				return !UIFormat.isEmptyString(item);
			});
			settings[SettingsKeys.TranslationLanguage] = formData.get(SettingsKeys.TranslationLanguage);
			settings[SettingsKeys.AutoTranslatioinEnabled] = getBool(formData.get(SettingsKeys.AutoTranslatioinEnabled));
			settings[SettingsKeys.HighlightStyling] = {};
			settings[SettingsKeys.HighlightStyling][HighlightStylingKeys.addBackgroundColor] = getBool(formData.get(SettingsKeys.HighlightStyling+"."+HighlightStylingKeys.addBackgroundColor));
			settings[SettingsKeys.HighlightStyling][HighlightStylingKeys.backgroundColor] = formData.get(SettingsKeys.HighlightStyling+"."+HighlightStylingKeys.backgroundColor);
			settings[SettingsKeys.HighlightStyling][HighlightStylingKeys.addShaddow] = getBool(formData.get(SettingsKeys.HighlightStyling+"."+HighlightStylingKeys.addShaddow));
			settings[SettingsKeys.HighlightStyling][HighlightStylingKeys.addUnderline] = getBool(formData.get(SettingsKeys.HighlightStyling+"."+HighlightStylingKeys.addUnderline));
			settings[SettingsKeys.HighlightStyling][HighlightStylingKeys.customCSS] = formData.get(SettingsKeys.HighlightStyling+"."+HighlightStylingKeys.customCSS);
			
			Register.settingsManager.saveSettings(settings, function() {
				tellSaved();
				highlightExampleText();
			});
		});
		
//		UIManager.addEvent(sitesBlackListTextArea, "keydown", function(event) 
//		{
//			if (event.keyCode === 13 && event.ctrlKey) // enter
//			{
//				event.preventDefault();
//				Register.settingsManager.UpdateSitesBlackList(sitesBlackListTextArea.value.split(";"), function ()
//				{
//					tellSaved();
//				});
//			}
//		});
//		
//		UIManager.addEvent(sitesBlackListTextArea, "input", function() 
//		{
//			if (UIManager.getValue(sitesBlackListTextArea) != sitesInitialValues)
//			{
//				tellNotSaved();
//			}
//			else
//			{
//				tellNothingToSave();
//			}
//		});
//		
//		UIManager.addEvent(enableAutoTranslateCheckbox, "change", function() 
//		{
//			Register.settingsManager.setAutoTranslationEnabled(enableAutoTranslateCheckbox.checked, 
//			function () { 
//				tellSaved(); 
//			});
//		});
//		
//		UIManager.addEvent(languageSelect, "change", function() 
//		{
//			Register.settingsManager.SetTranslationLanguage(languageSelect.value, function () { tellSaved(); });
//		})

		BingClient.GetSupportedLangs(function (langs)
		{
			Register.settingsManager.getSettings(function (settings)
			{
				settings[SettingsKeys.SitesBlackList] = settings[SettingsKeys.SitesBlackList].join("; ");
				
				langs.sort();
				settings.AvailableLanguagesHTML = "";
				performOnElsList(langs, function(val, i) {
					settings.AvailableLanguagesHTML += Register.templater.formatTemplate("TranslationLangOption", {
						value: val,
						title: val,
						selected: settings[SettingsKeys.TranslationLanguage] === langs[i]
					});
				});
				
				UIManager.setHTML(getEl("TR-SettingsFormBody"), Register.templater.formatTemplate("SettingsForm", settings));
				
				UIManager.autogrowTetarea(getEl("TR-HighlightCustomCSS"));
				UIManager.adaptElHeight(getEl("TR-HighlightCustomCSS"));
				//var picker = new jscolor(getEl('TR-HighlightBGColor'));
				
				highlightExampleText();
				
//				for (var i = 0; i < langs.length; i++)
//				{
//					
//					var option = document.createElement("option");
//					option.setAttribute("value", langs[i]);
//					option.selected = settings[SettingsKeys.TranslationLanguage] == langs[i];
//					option.innerHTML = langs[i];
//					languageSelect.appendChild(option);
//				}
			});
		});
	};
	
	function highlightExampleText() 
	{
		UIManager.setNodeFromHTML(getEl("TR-HighlightStylingExample"), "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Nullam mauris augue, sagittis sed vulputate non, congue sit amet ligula. " +
						"Vivamus blandit, ligula at finibus fringilla, massa purus gravida risus, quis lobortis leo velit nec magna.");
		
		var highlighter = new TranslationsHighlighter();
		highlighter.showTranslationsHighlights(getEl("TR-HighlightStylingExample"), [
			TranslationAdapter.getNew("vulputate", "test", "definition", ""),
			TranslationAdapter.getNew("ligula at finibus fringilla", "test", "definition", "")
		]);
	}


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
	TemplatesLoader.loadTemplates("templates/all.html", function() 
	{
		Register.optionsPage.init();
	});
};