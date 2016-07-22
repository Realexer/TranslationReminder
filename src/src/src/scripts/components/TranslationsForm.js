var TranslationForm = function(handler, data, langTo, autoTranslate)
{
	var _this = this;
	
	this.handler = handler;
	this.text = data.text;
	this.langTo = langTo;
	this.autoTranslate = autoTranslate;
	
	this.form = UIManager.addNodeFromHTML(handler, Register.templater.formatTemplate("TranslationForm", {
		text: data.text,
		translation: OR(data.translation, ""),
		definition: OR(data.definition, ""),
		image: OR(data.image, chrome.extension.getURL('imgs/select_image.png')),
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
	this.cancelImageButton = this.form.querySelector("._tr_cancelImageButton");
	this.textImage = this.form.querySelector("._tr_textImage");
	this.textDefinition = this.form.querySelector("._tr_textToTranslateDefinition");
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
		
		if (_this.autoTranslate) {
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
	};

	this.showLoadingAnimation = function() { UIManager.showEl(this.loadingAnimationImage); };
	this.hideLoadingAnimation = function() { UIManager.hideEl(this.loadingAnimationImage); };
	
	this.getImages = function() 
	{
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
				if(i == 0) {
					_this.textImage.src = image.MediaUrl;
				}
				UIManager.addNodeFromHTML(_this.imageSelector, 
					Register.templater.formatTemplate("TranslationFromImageToSelectFrom", 
					{
						src: image.MediaUrl
					})); 
			}, AppConfig.translationForm.imagesToShow);
			
			performOnElsList(_this.imageSelector.querySelectorAll("._tr_imageSelectFrom"), function(el) {
				UIManager.addEvent(el, "click", function(e, el) {
					_this.textImage.src = el.src;
					UIManager.setElData(_this.textImage, "tr-selected-image", _this.textImage.src);
				});
			});

			_this.hideLoadingAnimation();
		});
	};
	
	this.translateWithBing = function()
	{
		_this.showLoadingAnimation();
		Register.settingsManager.GetTranslationLanguage(function(toLang) 
		{
			BingClient.Translate(_this.text, OR(document.documentElement.lang, 'en'), toLang,
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
		
	};

	this.addTranslation = function()
	{
		this.doneCallback(
		{
			text: _this.text,
			definition: UIManager.getElData(_this.textDefinition, "tr-selected-definition"),
			image: UIManager.getElData(_this.textImage, "tr-selected-image"),
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