var BrowserPage = function ()
{
	var _this = this;
	
	this.Init = function ()
	{
		Register.settingsManager.ifSiteNotInBlackList(document.domain, function() 
		{
			TemplatesLoader.loadTemplates("templates/common.html", document.body, function() 
			{
				TemplatesLoader.loadFile("css/common.css", function(commonCSS) 
				{
					TemplatesLoader.loadFile("css/BrowserPage.css", function(browserPageCSS) 
					{
						// using different html handler to 
						// prevent observing DOM changes that are made by the extension
						var rootHandler = UIManager.addNodeFromHTML(document.body, Register.templater.formatTemplate("TR-ShaddowRoot"));
						var root = rootHandler.createShadowRoot(); 
						
						var combinedCss = "<style>"+commonCSS + browserPageCSS +"</style>";
						UIManager.addNodeFromHTML(root, combinedCss);
						
						var htmlHandler = UIManager.addNodeFromHTML(root, Register.templater.formatTemplate("TR-Handler"));

						Register.translationsHighlighter = new TranslationsHighlighter(htmlHandler);
						Register.translationsHighlighter.init(function() {
							Register.translationsHighlighter.showHighlightsOnDocuemnt();
						});

						Register.translationFormHandler = new TranslationFormHandler(htmlHandler);
						Register.translationFormHandler.init();

						UIManager.addEvent(document.body, "mouseup", function(event, el) 
						{
							if (event.target == rootHandler)
								return false;

							Register.translationsHighlighter.hideAllTranslationDetails();

							if (event.ctrlKey || event.metaKey)
							{
								Register.translationFormHandler.display(event);
							}
							else 
							{
								Register.translationFormHandler.dismiss();
							}
						});
						
						_this.setupObserver();
					});
				});
			});
		});
	};
	
	this.setupObserver = function() 
	{
		var updateTimeout = null;
		var addedNodes = [];

		var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.addedNodes) 
				{
					try {
						performOnElsList(mutation.addedNodes, function(node) {
							try
							{
								if([1, 3].indexOf(node.nodeType) !== -1 
								&& node.parentNode != null
								&& node.tagName != "trhandler".toUpperCase() 
								&& !UIFormat.isEmptyString(node.innerHTML)) 
								{
									//console.log(mutation.type);

									addedNodes.push(node);
								}
							} catch(e) {
								console.log(e);
							}
						});

						if(addedNodes.length > 0) 
						{
							if(updateTimeout) {
								Timeout.reset(updateTimeout);
							}

							updateTimeout = Timeout.set(function() 
							{
								var textNodes = [];
								performOnElsList(addedNodes, function(node) {
									if(!node.hasInParents("TR-Handler")) 
									{
										textNodes = textNodes.concat(Register.translationsHighlighter.getTextNodes(node));
									}
								});

								if(textNodes.length > 0) {
									Register.translationsHighlighter.showHighlightsOnTextNodes(textNodes);
									console.log("Highlighting on added text nodes: ");
									console.log(textNodes);
								}

								addedNodes = [];
							}, 2000);
						}
					}
					catch(e)
					{
						console.log(e);
					}
				}
			});
		});

		observer.observe(document.body, { childList: true, characterData: true, subtree: true });
	};
	
	this.reload = function() 
	{
		this.Init();
	};
};

var TranslationFormHandler = function(htmlHandler) 
{
	var _this = this;
	
	this.dataHandler = htmlHandler;
	
	this.formHandler = null;
	this.formHandlerBody = null;
	this.formHandlerCloseButton = null;
	
	this.init = function() 
	{
		this.formHandler = UIManager.addNodeFromHTML(htmlHandler, 
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
		
		Register.settingsManager.getSettings(function(settings) 
		{
			_this.form = new TranslationForm(_this.formHandlerBody, {
				text: selectedText 
			}, {
				langFrom: settings[SettingsKeys.SourceLanguage],
				langTo: settings[SettingsKeys.TranslationLanguage],
				autoTranslate: getBool(settings[SettingsKeys.AutoTranslationEnabled]), 
				translationEditable: true,
				imageEditable: true
			});

			_this.form.setup(function(result) 
			{
				if (result.translation.length > 0)
				{
					Register.dictionaryManager.AddTranslation(result.text, result.translation, result.image, result.definition, result.lang,
					function ()
					{
						Register.translationsHighlighter.showHighlightsOnDocuemnt();
						UIManager.addClassToEl(_this.formHandler, "TR-Successful");

						setTimeout(function ()
						{
							_this.dismiss();
							UIManager.removeClassFromEl(_this.formHandler, "TR-Successful");
						}, 50);
					});
				}
			},
			function() {
				_this.position(selection, event);
				UIManager.showEl(_this.formHandler);
			});

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