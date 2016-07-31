var OptionsPage = function ()
{
	var _this = this;

	var settingsForm = getEl("TR-SettingsForm");

	this.init = function ()
	{		
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
			
			settings[SettingsKeys.RestrictedTags] = formData.get(SettingsKeys.RestrictedTags).split(";").TrimAllElements().RemoveDuplicates().filter(function(item) {
				return !UIFormat.isEmptyString(item);
			});
			
			Register.settingsManager.saveSettings(settings, function() {
				highlightExampleText();
				UIManager.addClassToEl(getEl("TR-Options"), "TR-Successful");
				
				Timeout.set(function(){
					UIManager.removeClassFromEl(getEl("TR-Options"), "TR-Successful");
				}, 180);
			});
		});

		BingClient.GetSupportedLangs(function (langs)
		{
			Register.settingsManager.getSettings(function (settings)
			{
				settings[SettingsKeys.SitesBlackList] = settings[SettingsKeys.SitesBlackList].join("; ");
				settings[SettingsKeys.RestrictedTags] = settings[SettingsKeys.RestrictedTags].join("; ");
				settings.restrictedTagsDefault = AppConfig.restrictedTags.join("; ");
				
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
				
				highlightExampleText();
			});
		});
	};
	
	function highlightExampleText() 
	{
		UIManager.setNodeFromHTML(getEl("TR-HighlightStylingExample"), "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Nullam mauris augue, sagittis sed vulputate non, congue sit amet ligula. " +
						"Vivamus blandit, ligula at finibus fringilla, massa purus gravida risus, quis lobortis leo velit nec magna.");
		
		var highlighter = new TranslationsHighlighter(document.body);
		highlighter.init(function() {
			highlighter.showTranslationsHighlights(getEl("TR-HighlightStylingExample"), [
				TranslationAdapter.getNew("vulputate", "test", "definition", ""),
				TranslationAdapter.getNew("ligula at finibus fringilla", "test", "definition", "")
			]);
		});
	}
};

window.onload = function ()
{
	Register.optionsPage = new OptionsPage();
	TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
	{
		Register.optionsPage.init();
	});
};