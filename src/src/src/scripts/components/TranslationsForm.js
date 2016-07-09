var TranslationsForm = function() 
{
	var _this = this;
	
	var selectedText = null;
	
	var translationFormHandler = function(handler)
	{
		var _this = this;
		
		this.form = handler;
		this.wordAddingFormCurrentSelection = handler.querySelector("._tr_textToTranslate");
		this.wordAddingFormTranslationInput = handler.querySelector("._tr_translationInput");
		this.wordAddingFormSpecifiedTranslation = handler.querySelector("._tr_textTranslation");
		this.wordAddingFormEnterKeyButton = handler.querySelector("._tr_setTranslationButton");
		this.wordAddingFormCloseButton = handler.querySelector("._tr_close");
		this.loadingAnimationImage = handler.querySelector("._tr_loading");
		this.bingButton = handler.querySelector("._tr_bingButton");
		this.translationLanguageSpan = handler.querySelector("._tr_translateTo");
		
		this.setup = function() 
		{
			UIManager.addEvent(this.wordAddingFormTranslationInput, "input", function() {
				UIManager.setHTML(_this.wordAddingFormSpecifiedTranslation, UIManager.getValue(_this.wordAddingFormTranslationInput));
			});

			UIManager.addEvent(_this.wordAddingFormTranslationInput, "keydown", function() 
			{
				switch(event.keyCode) {
					case 13:
						Register.translationsForm.addWord();
						break;
						
					case 27:
						Register.translationsForm.hideNewWordAddingForm();
						break;
				}
			});
			
			UIManager.addEvent(_this.wordAddingFormEnterKeyButton, "click", function() 
			{
				Register.translationsForm.addWord();
			});
			
			UIManager.addEvent(_this.bingButton, "click", function() {
				Register.translationsForm.performWordTranslation();
			});

			UIManager.addEvent(_this.wordAddingFormCloseButton, "click", function () { 
				Register.translationsForm.hideNewWordAddingForm(); 
			});
		};
		
		this.show = function() { UIManager.showEl(this.form, "table"); };
		this.hide = function() { UIManager.hideEl(this.form); };
		
		this.position = function(selection, event) 
		{
			var range = selection.getRangeAt(0);
			var selectionRect = range.getBoundingClientRect();

			// In textareas selectionRect is filled with zeros. Reason unknown. 
			// Trying to solve by using mouse coordiates to find the place where to show the form
			if (selectionRect.left == 0 && selectionRect.top == 0)
			{
				selectionRect =
				{
					right: event.x,
					top: event.y,
					width: 0,
					height: 0
				};
			}

			var formRect = _this.form.getBoundingClientRect();
			UIManager.setStyle(_this.form, "left", (window.scrollX + selectionRect.right - selectionRect.width / 2), "px");
			UIManager.setStyle(_this.form, "top", (window.scrollY + selectionRect.top - formRect.height), "px");
		};
		
		this.focusTranslationInput = function() 
		{
			UIManager.setFocus(_this.wordAddingFormTranslationInput);
		};

		this.showLoadingAnimation = function() { UIManager.showEl(this.loadingAnimationImage); };
		this.hideLoadingAnimation = function() { UIManager.hideEl(this.loadingAnimationImage); };
	};
	
	this.formHandler = null;
	
	this.init = function() 
	{
		var formEl = UIManager.addNodeFromHTML(document.body, Register.templater.formatTemplate("AddingTranslationForm", {
			config: {
				bingIcon: chrome.extension.getURL('imgs/bing_icon.png'),
				loadingAnimation: chrome.extension.getURL('imgs/loading.gif')
			}
		}));
			
		this.formHandler = new translationFormHandler(formEl);
		this.formHandler.setup();
	};
	
	this.display = function (event)
	{
		var selection = window.getSelection();
		selectedText = selection.toString().trim();

		if (selectedText.length === 0)
		{
			_this.hideNewWordAddingForm();
			selectedText = null;
			return false;
		}

		_this.formHandler.position(selection, event);
		_this.formHandler.show();
		_this.formHandler.focusTranslationInput();
		
		UIManager.setValue(_this.formHandler.wordAddingFormTranslationInput, "");
		UIManager.clearEl(_this.formHandler.wordAddingFormSpecifiedTranslation);

		UIManager.setHTML(_this.formHandler.wordAddingFormCurrentSelection, selectedText);
		
		Register.settingsManager.GetTranslationLanguage(function (lang)
		{
			UIManager.setHTML(_this.formHandler.translationLanguageSpan, "'" + lang.toUpperCase() + "'");
		});

		Register.settingsManager.IsAutotranslationEnabled(function (isEnabled)
		{
			if (isEnabled) {
				_this.performWordTranslation();
			}
		});
	};

	this.hideNewWordAddingForm = function()
	{
		_this.formHandler.hide();
		UIManager.clearEl(_this.formHandler.wordAddingFormCurrentSelection);
		
		selectedText = null;
	};
	
	this.performWordTranslation = function()
	{
		_this.formHandler.showLoadingAnimation();
		Register.settingsManager.GetTranslationLanguage(function(toLang) 
		{
			new BingClient().Translate(selectedText, document.documentElement.lang, toLang,
			function (result)
			{
				var translation = result.trim("\"");
				UIManager.setValue(_this.formHandler.wordAddingFormTranslationInput, translation);
				UIManager.setHTML(_this.formHandler.wordAddingFormSpecifiedTranslation, translation);

				UIManager.setFocus(_this.formHandler.wordAddingFormTranslationInput);

				_this.formHandler.hideLoadingAnimation();
			});
		});
		
	};

	this.addWord = function()
	{
		if (selectedText.length > 0)
		{
			var translation = UIManager.getValue(_this.formHandler.wordAddingFormTranslationInput);

			if (translation.length > 0)
			{
				Register.wordsManager.AddWord(selectedText, translation, null,
				function ()
				{
					Register.translationsHighlighter.showHighlights();
					UIManager.addClassToEl(_this.formHandler.form, "TR-Successful");

					setTimeout(function ()
					{
						_this.hideNewWordAddingForm();
						UIManager.removeClassFromEl(_this.formHandler.form, "TR-Successful");
					}, 50);
				});
			}
		}
	};
};

EventsManager.subscribe(Events.htmlChanged, function(el) 
{
	performOnElsList(el.querySelectorAll("[data-src]"), function(el) 
	{
		UIManager.setElAttr(el, "src", UIManager.getElData(el, "src"));
	});
});