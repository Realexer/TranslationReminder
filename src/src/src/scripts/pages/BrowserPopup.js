var BrowserPopup = function ()
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
	
	this.translationsLearning = [];

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

				_this.translationsLearning = translations.filter(function(translationItem) {
					return !translationItem.learned;
				});

				performOnElsList(_this.translationsLearning, function(data, i) {
					data.index = i;
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
						editTranslation(_this.translationsLearning[UIManager.getElData(el, "tr-raw")]); 
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
			var form = new TranslationForm(translationEditingForm.querySelector("._tr_body"), data, langTo, false);

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

window.onload = function ()
{
	var browserPopup = new BrowserPopup();
	browserPopup.Init();
};