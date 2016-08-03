var TranslationForm = function(handler, data, options)
{
	var _this = this;
	
	this.handler = handler;
	this.text = data.text;
	this.options = options;
	
	this.form = UIManager.addNodeFromHTML(handler, Register.templater.formatTemplate("TranslationForm", {
		text: data.text,
		translation: OR(data.translation, ""),
		definition: OR(data.definition, ""),
		image: OR(data.image, AppConfig.images.selectTextImage),
		selectedImage: OR(data.image, ""),
		langTo: options.langTo.toUpperCase(),
		config: {
			bingIcon: AppConfig.images.bingIcon,
			glosbeIcon: AppConfig.images.glosbeIcon,
			loadingAnimation: AppConfig.images.loadingAnimation
		}
	}));

	this.selectionInput = this.form.querySelector("._tr_textToTranslateInput");
	this.translationInput = this.form.querySelector("._tr_translationInput");
	this.imageSelectorHandler = this.form.querySelector("._tr_imageSelectorHandler");
	this.imageSelector = this.form.querySelector("._tr_imageSelector");
	this.chooseImageButton = this.form.querySelector("._tr_chooseImageButton");
	this.cancelImageButton = this.form.querySelector("._tr_cancelImageButton");
	this.textImage = this.form.querySelector("._tr_textImage");
	this.textImageInput = this.form.querySelector("._tr_selectedImageInput");
	this.textDefinition = this.form.querySelector("._tr_textToTranslateDefinition");
	this.specifiedTranslation = this.form.querySelector("._tr_textTranslation");
	this.enterKeyButton = this.form.querySelector("._tr_setTranslationButton");
	this.closeButton = this.form.querySelector("._tr_close");
	this.loadingAnimationImage = this.form.querySelector("._tr_loading");
	this.bingTranslateButton = this.form.querySelector("._tr_bingButton");
	this.globseTranslateButton = this.form.querySelector("._tr_globseButton");
	this.translationLanguageSpan = this.form.querySelector("._tr_translateTo");
	
	this.doneCallback = null;

	this.setup = function(doneCallback, setupFinished) 
	{
		this.doneCallback = doneCallback;
		
		this.selectionInput.disabled = !this.options.editable;
		
		UIManager.setFocus(_this.translationInput);
		
		if (_this.options.autoTranslate) {
			_this.translateWithBing();
		}
		
		UIManager.addEvent(this.translationInput, "input", function() {
			UIManager.setHTML(_this.specifiedTranslation, UIManager.getValue(_this.translationInput));
		});

		UIManager.addEvent(_this.translationInput, "keydown", function(event) 
		{
			switch(event.keyCode) {
				case 13:
					_this.addTranslation();
					break;
			}
		});

		UIManager.addEvent(_this.enterKeyButton, "click", function() 
		{
			_this.addTranslation();
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
		
		UIManager.addEvent(_this.cancelImageButton, "click", function() {
			_this.textImage.src = UIManager.getElData(_this.textImage, "tr-default-image");
			UIManager.hideEl(_this.imageSelectorHandler);
		});
		
		UIManager.addEvent(_this.textImageInput, "change", function() {
			_this.textImage.src = OR(UIManager.getValue(_this.textImageInput), UIManager.getElData(_this.textImage, "tr-default-image"));
		});
		
		setupFinished();
		
		UIManager.autogrowTetarea(_this.selectionInput);
		UIManager.autogrowTetarea(_this.translationInput);
	};

	this.showLoadingAnimation = function() { UIManager.showEl(this.loadingAnimationImage); };
	this.hideLoadingAnimation = function() { UIManager.hideEl(this.loadingAnimationImage); };
	
	this.getImages = function() 
	{
		_this.showLoadingAnimation();
		UIManager.showEl(_this.imageSelectorHandler);
		UIManager.clearEl(_this.imageSelector);
		
		BingClient.GetImages(UIManager.getValue(_this.selectionInput),
		function (result)
		{
			//console.log(result);
			var images = result.d.results;
			performOnElsList(images, function(image, i) 
			{
				UIManager.addNodeFromHTML(_this.imageSelector, 
					Register.templater.formatTemplate("TranslationFromImageToSelectFrom", 
					{
						src: image.MediaUrl
					})); 
			}, AppConfig.translationForm.imagesToShow);
			
			performOnElsList(_this.imageSelector.querySelectorAll("._tr_imageSelectFrom"), function(el) {
				UIManager.addEvent(el, "click", function(e, el) {
					_this.textImage.src = el.src;
					UIManager.setValue(_this.textImageInput, _this.textImage.src);
				});
			});

			_this.hideLoadingAnimation();
		});
	};
	
	this.translateWithBing = function()
	{
		if(UIManager.getValue(_this.selectionInput).split(" ").length <= AppConfig.translationForm.textMaxWordsToTranslate.bing) 
		{
			_this.showLoadingAnimation();
			
			Register.settingsManager.GetTranslationLanguage(function(toLang) 
			{
				BingClient.Translate(UIManager.getValue(_this.selectionInput), OR(document.documentElement.lang, 'en'), toLang,
				function (result)
				{
					var translation = result.trim("\"");
					UIManager.setValue(_this.translationInput, translation);
					UIManager.setHTML(_this.specifiedTranslation, translation);

					UIManager.setFocus(_this.translationInput);

					_this.hideLoadingAnimation();
				});
			});
		} else {
			alert("Text to translate with Bing should contain no more than "+AppConfig.translationForm.textMaxWordsToTranslate.bing+" words.");
		}
	};
	
	this.translateWithGlobse = function()
	{
		if(UIManager.getValue(_this.selectionInput).split(" ").length <= AppConfig.translationForm.textMaxWordsToTranslate.glosbe) 
		{
			_this.showLoadingAnimation();
			Register.settingsManager.GetTranslationLanguage(function(toLang) 
			{
				GlosbeClient.Translate(_this.text, OR(document.documentElement.lang, 'en'), toLang,
				function (translation)
				{
					console.log(translation);
					var result = {
						definitionOrigin: [],
						definitionTranslated: [],
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

					console.log(result);

					if(result.definitionOrigin.length > 0) {
						UIManager.setHTML(_this.textDefinition, result.definitionOrigin[0].text);
						UIManager.setElData(_this.textDefinition, "tr-selected-definition", result.definitionOrigin[0].text);
					}

					UIManager.setValue(_this.translationInput, result.translation);
					UIManager.setHTML(_this.specifiedTranslation, result.translation);

					UIManager.setFocus(_this.translationInput);

					_this.hideLoadingAnimation();
				});
			});
		} else {
			alert("Text to translate with Glosbe should contain no more than "+AppConfig.translationForm.textMaxWordsToTranslate.glosbe+" words.");
		}
	};

	this.addTranslation = function()
	{
		this.doneCallback(
		{
			text: UIManager.getValue(_this.selectionInput),
			definition: UIManager.getElData(_this.textDefinition, "tr-selected-definition"),
			image: UIManager.getValue(_this.textImageInput),
			translation: UIManager.getValue(_this.translationInput)
		});
	};
};

EventsManager.subscribe(Events.htmlChanged, function(el) 
{
	performOnElsList(el.querySelectorAll("[data-tr-src]"), function(el) 
	{
		UIManager.setElAttr(el, "src", UIManager.getElData(el, "tr-src"));
	});
});