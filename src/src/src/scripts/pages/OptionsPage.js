var OptionsView = function ()
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

var DictionaryView = function ()
{
	var _this = this;
	
	var translationsTableLearning = getEl("TR-WordsListLearning");
	var translationsTableLearned = getEl("TR-WordsListLearned");
	var loadingAnimation = getEl("TR-LoadingAnimation");
	var noTranslationsView = getEl("TR-NoWordsView");
	var translationEditingForm = getEl("TR-EditTranslation");

	var currentTablesOrder =
	{
		field: TranslationsOrder.order.date,
		direction: TranslationsOrder.direction.DESC,
		
		switchDirection: function() 
		{
			this.direction = this.direction == TranslationsOrder.direction.DESC 
								? TranslationsOrder.direction.ASC 
								: TranslationsOrder.direction.DESC;
		}
	};
	
	this.translations = [];

	this.Init = function ()
	{
		var orderByDateButton = getEl("TR-OrderWordsByDate");
		var orderByHitsButton = getEl("TR-OrderWordsByHits");

		UIManager.addEventNoDefault(orderByDateButton, "click", function ()
		{
			UIManager.removeClassFromEl(orderByHitsButton, "TR-SelectedWordsOrder");
			UIManager.addClassToEl(orderByDateButton, "TR-SelectedWordsOrder");

			currentTablesOrder.field = TranslationsOrder.order.date;
			currentTablesOrder.switchDirection();

			showUserTranslations();
		});

		UIManager.addEventNoDefault(orderByHitsButton, "click", function ()
		{
			UIManager.removeClassFromEl(orderByDateButton, "TR-SelectedWordsOrder");
			UIManager.addClassToEl(orderByHitsButton, "TR-SelectedWordsOrder");
			
			currentTablesOrder.field = TranslationsOrder.order.hits;
			currentTablesOrder.switchDirection();

			showUserTranslations();
		});
		
		UIManager.addEvent(translationEditingForm.querySelector("._tr_close"), "click", function() {
			finishEditing();
		});

		TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
		{
			showUserTranslations();
		});
	};


	function showUserTranslations()
	{
		UIManager.showEl(loadingAnimation);
		UIManager.clearEl(translationsTableLearning);
		UIManager.clearEl(translationsTableLearned);

		Register.translationsManager.GetTranslations(function (translations)
		{
			if (translations.length > 0)
			{
				UIManager.setHTML(getEl("TR-WordsCount"), translations.length + " word" + (translations.length > 1 ? "s" : ""));

				UIManager.hideEl(noTranslationsView);
				
				_this.translations = [];
				performOnElsList(translations, function(item, i) {
					item.index = i;
					_this.translations.push(item);
				});

				performOnElsList(translations.filter(function(translationItem) {
					return !translationItem.learned;
				}), function(data, i) {
					data.image = OR(data.image, AppConfig.images.noTextImage);
					data.rowClass = (i % 2 == 0) ? "TR-BG-Light" : "TR-BG-Dark";
					UIManager.addHTML(translationsTableLearning, Register.templater.formatTemplate("WordLearningRowItem", data));
				});
				
				performOnElsList(translations.filter(function(translationItem) {
					return translationItem.learned;
				}), function(data, i) {
						data.image = OR(data.image, AppConfig.images.noTextImage);
						data.rowClass = (i % 2 == 0) ? "TR-BG-Grey-Light" : "TR-BG-Grey-Dark";
						UIManager.addHTML(translationsTableLearned, Register.templater.formatTemplate("WordLearnedRowItem", data));
				});

				performOnElsList(document.querySelectorAll(".TR-KnowIt"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						markTranslationAsLearned(UIManager.getElData(button, "tr-text")); 
					});
				});
				
				performOnElsList(document.querySelectorAll(".TR-EditTranslationButton"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function(e, el) {
						editTranslation(_this.translations[UIManager.getElData(el, "tr-index")]); 
					});
				});
				
				performOnElsList(document.querySelectorAll(".TR-DeleteTranslationButton"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function(e, el) {
						deleteTranslation(_this.translations[UIManager.getElData(el, "tr-index")]); 
					});
				});
				
				performOnElsList(document.querySelectorAll(".TR-BackToLearning"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						moveBackToLearning(UIManager.getElData(button, "tr-text")); 
					});
				});
			}
			else
			{
				UIManager.showEl(noTranslationsView);
			}

			UIManager.hideEl(loadingAnimation);
		}, 
		{
			order: currentTablesOrder
		});
	};
	
	function editTranslation(data) 
	{
		Register.settingsManager.GetTranslationLanguage(function (langTo)
		{
			var form = new TranslationForm(translationEditingForm.querySelector("._tr_body"), data, 
			{
				langTo: langTo,
				autoTranslate: false, 
				editable: false
			});

			form.setup(function(result) 
			{
				if (result.translation.length > 0)
				{
					Register.translationsManager.EditTranslation(result.text, result.translation, result.image, result.definition,
					function ()
					{
						UIManager.addClassToEl(translationEditingForm.querySelector(".TR-Body"), "TR-Successful");
	
						setTimeout(function ()
						{
							showUserTranslations();
							finishEditing();
							UIManager.removeClassFromEl(translationEditingForm.querySelector(".TR-Body"), "TR-Successful");
						}, 500);
					});
				}
			},
			function() {
				UIManager.showEl(translationEditingForm);
				UIManager.scrollIntoView(translationEditingForm);
			});
		});
	};
	
	function deleteTranslation(translation) 
	{
		Register.translationsManager.DeleteTranslation(translation.text,
		function ()
		{
			showUserTranslations();
		});
	}
	
	function finishEditing() 
	{
		UIManager.hideEl(translationEditingForm);
		UIManager.clearEl(translationEditingForm.querySelector("._tr_body"));
	}


	function markTranslationAsLearned(text)
	{
		Register.translationsManager.setTextLearned(text, function() {
			showUserTranslations();
		});
	};
	
	function moveBackToLearning(text)
	{
		Register.translationsManager.setTextLearning(text, function() {
			showUserTranslations();
		});
	};
};

var OptionsPage = function() 
{
	var _this = this;
	
	var sectionsHandler = getEl("TR-SectionsHandler");
	var dictionarySection = getEl("TR-DictionaryHandler");
	var optionsSection = getEl("TR-OptionsHandler");
	
	this.init = function() 
	{
		if(window.location.search.indexOf("dictionary") !== -1) 
		{
			Register.dictionaryView = new DictionaryView();
			Register.dictionaryView.Init();
			UIManager.showEl(dictionarySection);
		}
		else 
		{
			Register.optionsView = new OptionsView();
			TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
			{
				UIManager.showEl(optionsSection);
				Register.optionsView.init();
			});
		}
	};
}

window.onload = function ()
{
	Register.optionsPage = new OptionsPage();
	Register.optionsPage.init();
};