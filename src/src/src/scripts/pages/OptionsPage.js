var OptionsView = function (htmlHandler)
{
	var _this = this;

	var settingsForm = getEl("TR-SettingsForm");

	this.init = function ()
	{
		Register.optionsPage.showLoadingAnimation();
		
		UIManager.addEventNoDefault(settingsForm, "submit", function(e) 
		{
			Register.settingsManager.getSettings(function(settings) 
			{
				settings = OR(settings, {});
				
				var formData = new FormData(settingsForm);
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
					UIManager.addClassToEl(htmlHandler, "TR-Successful");

					Timeout.set(function(){
						UIManager.removeClassFromEl(htmlHandler, "TR-Successful");
					}, 180);
				});
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
				UIManager.autogrowTetarea(getEl("TR-SitesBlackList"));
				UIManager.autogrowTetarea(getEl("TR-RestrictedTags"));
				
				highlightExampleText();
				
				Register.optionsPage.hideLoadingAnimation();
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
	var translationsTableLearnedHeader = getEl("TR-WordsListLearnedHead");
	var noTranslationsView = getEl("TR-EmptyDictionaryView");
	var dictionaryView = getEl("TR-DictionaryView");
	var translationEditingForm = getEl("TR-EditTranslationForm");

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
		
		UIManager.addEventNoDefault(getEl("TR-ExportDictionaryLink"), "click", function() {
			DictionaryExporter.export(); 
		});
		
		UIManager.addEventNoDefault(getEl("TR-ImportWordsForm"), "submit", function(e, form) {
			var file = new FormData(form).get("csv");
			if(file.size > 0) {
				DictionaryExporter.import(file); 
			}
		});

		TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
		{
			showUserTranslations();
		});
	};


	function showUserTranslations()
	{
		Register.optionsPage.showLoadingAnimation();
		UIManager.clearEl(translationsTableLearning);
		UIManager.clearEl(translationsTableLearned);

		Register.dictionaryManager.GetTranslations(function (translations)
		{
			if (translations.length > 0)
			{
				UIManager.hideEl(noTranslationsView);
				
				_this.translations = [];
				performOnElsList(translations, function(item, i) {
					item.index = i;
					_this.translations.push(item);
				});

				performOnElsList(translations.filter(function(translationItem) {
					return !translationItem.learned;
				}), function(data, i) {
					var tr = TranslationAdapter.getFromExisting(data);
					tr.image = OR(tr.image, AppConfig.images.noTextImage);
					tr.rowClass = (i % 2 == 0) ? "TR-BG-Light" : "TR-BG-Dark";
					UIManager.addHTML(translationsTableLearning, Register.templater.formatTemplate("WordLearningRowItem", tr));
				});
				
				var translationsLearned = translations.filter(function(translationItem) {
					return translationItem.learned;
				});
				
				if(translationsLearned.length > 0) 
				{
					performOnElsList(translationsLearned, function(data, i) 
					{
						var tr = TranslationAdapter.getFromExisting(data);
						tr.image = OR(tr.image, AppConfig.images.noTextImage);
						tr.rowClass = (i % 2 == 0) ? "TR-BG-Grey-Light" : "TR-BG-Grey-Dark";
						UIManager.addHTML(translationsTableLearned, Register.templater.formatTemplate("WordLearnedRowItem", tr));
					});
					
					UIManager.setHTML(getEl("TR-TranslationsLearnedAmount"), Register.templater.formatTemplate("TranslationsLearnedAmount", {
						amount: translationsLearned.length
					}));
					
				} else {
					UIManager.hideEl(translationsTableLearnedHeader);
				}

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
				
				UIManager.setHTML(getEl("TR-TransltionsTotal"), Register.templater.formatTemplate("TranslationsAmount", {
					amount: translations.length
				}));
				
				Templater.UI.setSrc(dictionaryView);
			}
			else
			{
				UIManager.showEl(noTranslationsView);
				UIManager.hideEl(dictionaryView);
			}

			Register.optionsPage.hideLoadingAnimation();
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
				langFrom: OR(data.lang, "en"), // temporary as previous records doens't contain lang propoery
				langTo: langTo,
				autoTranslate: false, 
				translationEditable: false,
				imageEditable: true
			});

			form.setup(function(result) 
			{
				if (result.translation.length > 0)
				{
					Register.dictionaryManager.EditTranslation(result.text, result.translation, result.image, result.definition,
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
		if(window.confirm("Delete translation '"+translation.text+"' from dictionary?")) 
		{
			Register.dictionaryManager.DeleteTranslation(translation.text,
			function ()
			{
				showUserTranslations();
			});
		}
	}
	
	function finishEditing() 
	{
		UIManager.hideEl(translationEditingForm);
		UIManager.clearEl(translationEditingForm.querySelector("._tr_body"));
	}


	function markTranslationAsLearned(text)
	{
		Register.dictionaryManager.setTextLearned(text, function() {
			showUserTranslations();
		});
	};
	
	function moveBackToLearning(text)
	{
		Register.dictionaryManager.setTextLearning(text, function() {
			showUserTranslations();
		});
	};
};

var DictionaryExporter = 
{
	export: function() 
	{
		Register.dictionaryManager.GetTranslations(function(translations) 
		{
			translations = JSON.parse(JSON.stringify(translations));
			
			var header = [];
			var learning = [];
			var learned = [];
			
			performOnElsList(translations, function(tr) 
			{
				if(header.length == 0) {
					header.push(Object.keys(tr).map(function (key) {return key}));
				}
				
				var trAr = Object.keys(tr).map(function (key) {return tr[key]});
				
				if(tr.learned) 
				{
					learned.push(trAr);
				} else {
					learning.push(trAr);
				}
			});
			
			var combined = header.concat(learning.concat(learned));
			
			var csvContent = "data:text/csv;charset=utf-8,";
			performOnElsList(combined, function(tr) {
				csvContent += tr.join(",") + "\n";
			});
			
			var encodedUri = encodeURI(csvContent);
			
			var downloadLink = document.createElement("a");
			downloadLink.href = encodedUri;
			downloadLink.download = "translation-reminder-dictionary.csv";

			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			
//			window.open(encodedUri);
		});
	},
	import: function(file) 
	{
		var reder = new FileReader();
      reder.onload = function(e) 
		{ 
			var contents = e.target.result;
			
			var lines = contents.split("\n");
			var header = lines.shift().split(",");
			
			var dictionary = [];
			
			performOnElsList(lines, function(line) 
			{
				var translationParts = line.split(",");
				
				var translation = [];
				
				performOnElsList(header, function(key, i) {
					translation[key] = translationParts[i];
				});
				
				dictionary.push(TranslationAdapter.getFromExisting(translation).getData());
			});
			
			//console.log(dictionary);
			
			Register.indexedStorage.setTranslations(dictionary, function() {
				window.location.reload();
			});
      };
		
      reder.readAsText(file);
	}
};

var OptionsPage = function() 
{
	var _this = this;
	
	var sectionsHandler = getEl("TR-SectionsHandler");
	var dictionarySection = getEl("TR-DictionaryHandler");
	var optionsSection = getEl("TR-OptionsHandler");
	var extraSection = getEl("TR-ExtraSection");
	var loadingAnimation = getEl("TR-LoadingAnimation");
	
	this.init = function() 
	{
		
		switch(window.location.search) 
		{
			case "?dictionary": {
				Register.dictionaryView = new DictionaryView();
				Register.dictionaryView.Init();
				UIManager.showEl(dictionarySection);
				UIManager.addClassToEl(getEl("TR-DictionaryLink"), "TR-OptionLinkSelected");
			}
			break;
			
			case "?extra": {
				
				TemplatesLoader.initTemplater();
				
				UIManager.setHTML(extraSection.querySelector("._body"), 
					Register.templater.formatTemplate("OptionsExtraSection", {
						version: AppConfig.manifest.version
					}));

				UIManager.showEl(extraSection);
				UIManager.addClassToEl(getEl("TR-ExtraLink"), "TR-OptionLinkSelected");
			}
			break;
			
			default: {
				Register.optionsView = new OptionsView(optionsSection);
				TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
				{
					UIManager.showEl(optionsSection);
					Register.optionsView.init();
				});

				UIManager.addClassToEl(getEl("TR-OptionsLink"), "TR-OptionLinkSelected");
			}
		}
	};
	
	this.showLoadingAnimation = function() 
	{
		UIManager.showEl(loadingAnimation);
	};
	
	this.hideLoadingAnimation = function() 
	{
		UIManager.hideEl(loadingAnimation);
	};
};

window.onload = function ()
{
	Register.optionsPage = new OptionsPage();
	Register.optionsPage.init();
};