var TranslationFormHandler = function() 
{
	var _this = this;
	
	this.formHandler = null;
	this.formHandlerBody = null;
	this.formHandlerCloseButton = null;
	
	this.init = function() 
	{
		this.formHandler = UIManager.addNodeFromHTML(document.body, 
			Register.templater.formatTemplate("TranslationFormHandler"));
		
		this.formHandlerBody = this.formHandler.querySelector("._tr_body");
		this.formHandlerCloseButton = this.formHandler.querySelector("._tr_close");
		
		UIManager.addEvent(this.formHandlerCloseButton, "click", function () { 
			_this.dismiss(); 
		});
		
		UIManager.addEvent(window, "keydown", function(event) 
		{
			switch(event.keyCode) {
				case 27:
					_this.dismiss();
					break;
			}
		});
	};
	
	this.display = function (event)
	{
		var selection = window.getSelection();
		var selectedText = selection.toString().trim();

		if (selectedText.length === 0)
		{
			_this.dismiss();
			return false;
		}
		
		Register.settingsManager.GetTranslationLanguage(function (lang)
		{
			_this.form = new TranslationForm(_this.formHandlerBody, selection, selectedText, lang);
			
			_this.form.setup(function(result) 
			{
				if (result.translation.length > 0)
				{
					Register.wordsManager.AddWord(result.text, result.translation,
					function ()
					{
						Register.translationsHighlighter.showHighlights();
						UIManager.addClassToEl(_this.formHandler, "TR-Successful");

						setTimeout(function ()
						{
							_this.dismiss();
							UIManager.removeClassFromEl(_this.formHandler, "TR-Successful");
						}, 50);
					});
				}
			});
			
			_this.position(selection, event);
			UIManager.showEl(_this.formHandler);
			
			//UIManager.setHTML(_this.formHandler.translationLanguageSpan, "'" + lang.toUpperCase() + "'");
		});
	};
	
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

		var formRect = _this.formHandler.getBoundingClientRect();
		UIManager.setStyle(_this.formHandler, "left", (window.scrollX + selectionRect.right - selectionRect.width / 2), "px");
		UIManager.setStyle(_this.formHandler, "top", (window.scrollY + selectionRect.top - formRect.height), "px");
	};
	
	this.dismiss = function()
	{
		UIManager.hideEl(this.formHandler);
		UIManager.clearEl(this.formHandlerBody);
	};
};

var TranslationForm = function(handler, selection, text, langTo)
{
	var _this = this;
	
	this.handler = handler;
	this.selection = selection;
	this.text = text;
	this.langTo = langTo;
	
	this.form = UIManager.addNodeFromHTML(handler, Register.templater.formatTemplate("TranslationForm", {
		text: text,
		langTo: langTo.toUpperCase(),
		config: {
			bingIcon: chrome.extension.getURL('imgs/bing_icon.png'),
			glosbeIcon: chrome.extension.getURL('imgs/glosbe_icon.png'),
			loadingAnimation: chrome.extension.getURL('imgs/loading.gif')
		}
	}));

	this.selection = this.form.querySelector("._tr_textToTranslate");
	this.translationInput = this.form.querySelector("._tr_translationInput");
	this.imageSelectorHandler = this.form.querySelector("._tr_imageSelectorHandler");
	this.imageSelector = this.form.querySelector("._tr_imageSelector");
	this.chooseImageButton = this.form.querySelector("._tr_chooseImageButton");
	this.textImage = this.form.querySelector("._tr_textImage");
	this.specifiedTranslation = this.form.querySelector("._tr_textTranslation");
	this.enterKeyButton = this.form.querySelector("._tr_setTranslationButton");
	this.closeButton = this.form.querySelector("._tr_close");
	this.loadingAnimationImage = this.form.querySelector("._tr_loading");
	this.bingTranslateButton = this.form.querySelector("._tr_bingButton");
	this.globseTranslateButton = this.form.querySelector("._tr_globseButton");
	this.translationLanguageSpan = this.form.querySelector("._tr_translateTo");
	
	this.doneCallback = null;

	this.setup = function(doneCallback) 
	{
		this.doneCallback = doneCallback;
		
		UIManager.setFocus(_this.translationInput);
		
		Register.settingsManager.IsAutotranslationEnabled(function (isEnabled)
		{
			if (isEnabled) {
				_this.translateWithBing();
			}
		});
		
		UIManager.addEvent(this.translationInput, "input", function() {
			UIManager.setHTML(_this.specifiedTranslation, UIManager.getValue(_this.translationInput));
		});

		UIManager.addEvent(_this.translationInput, "keydown", function(event) 
		{
			switch(event.keyCode) {
				case 13:
					_this.addWord();
					break;
			}
		});

		UIManager.addEvent(_this.enterKeyButton, "click", function() 
		{
			_this.addWord();
		});

		UIManager.addEvent(_this.bingTranslateButton, "click", function() {
			_this.translateWithBing();
		});

		UIManager.addEvent(_this.globseTranslateButton, "click", function() {
			_this.translateWithGlobse();
		});

		UIManager.addEvent(_this.textImage, "click", function() {
			_this.getImages();
		});

		UIManager.addEvent(_this.chooseImageButton, "click", function() {
			UIManager.hideEl(_this.imageSelectorHandler);
		});
	};

	this.showLoadingAnimation = function() { UIManager.showEl(this.loadingAnimationImage); };
	this.hideLoadingAnimation = function() { UIManager.hideEl(this.loadingAnimationImage); };
	
	var imageNum = 0;
	
	this.getImages = function() 
	{
		imageNum = 0;
		
		_this.showLoadingAnimation();
		UIManager.showEl(_this.imageSelectorHandler);
		UIManager.clearEl(_this.imageSelector);
		
		BingClient.GetImages(_this.text,
		function (result)
		{
			//console.log(result);
			var images = result.d.results;
			performOnElsList(images, function(image, i) 
			{
				if(i == imageNum) {
					_this.textImage.src = image.MediaUrl;
				}
				UIManager.addNodeFromHTML(_this.imageSelector, 
					Register.templater.formatTemplate("TranslationFromImageToSelectFrom", 
					{
						src: image.MediaUrl
					})); 
			}, 10);
			
			imageNum = Math.min(10, ++imageNum);

			_this.hideLoadingAnimation();
		});
	};
	
	this.translateWithBing = function()
	{
		_this.showLoadingAnimation();
		Register.settingsManager.GetTranslationLanguage(function(toLang) 
		{
			BingClient.Translate(_this.text, document.documentElement.lang, toLang,
			function (result)
			{
				var translation = result.trim("\"");
				UIManager.setValue(_this.translationInput, translation);
				UIManager.setHTML(_this.specifiedTranslation, translation);

				UIManager.setFocus(_this.translationInput);

				_this.hideLoadingAnimation();
			});
		});
	};
	
	this.translateWithGlobse = function()
	{
		_this.showLoadingAnimation();
		Register.settingsManager.GetTranslationLanguage(function(toLang) 
		{
			GlosbeClient.Translate(_this.text, document.documentElement.lang, toLang,
			function (translation)
			{
				console.log(translation);
				var result = {
					definitionOrigin: '',
					definitionTranslated: '',
					translation: ''
				};
				if(translation.result == "ok") 
				{
					if(translation.tuc.length > 0) 
					{
						var useTranslation = translation.tuc[0];
						if(useTranslation.meanings) {
							result.definitionOrigin = useTranslation.meanings.filter(function(el) {
								return el.language == translation.from;
							});
							result.definitionTranslated = useTranslation.meanings.filter(function(el) {
								return el.language == translation.dest;
							});
						}
						
						if(useTranslation.phrase) {
							result.translation = useTranslation.phrase.text;
						}
					}
				} else {
					console.log("Couldn't get translation from Glosbe.")
				}
//				var translation = result.trim("\"");
				UIManager.setValue(_this.translationInput, JSON.stringify(result));
				UIManager.setHTML(_this.specifiedTranslation, JSON.stringify(result));
//
//				UIManager.setFocus(_this.wordAddingFormTranslationInput);
//
				_this.hideLoadingAnimation();
			});
		});
		
	};

	this.addWord = function()
	{
		this.doneCallback(
		{
			text: _this.text,
			translation: UIManager.getValue(_this.translationInput)
		});
	};
};

EventsManager.subscribe(Events.htmlChanged, function(el) 
{
	performOnElsList(el.querySelectorAll("[data-src]"), function(el) 
	{
		UIManager.setElAttr(el, "src", UIManager.getElData(el, "src"));
	});
});