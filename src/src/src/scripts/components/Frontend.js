var Frontend = function ()
{
	var _this = this;
	
	this.Init = function ()
	{
		TemplatesLoader.loadTemplates("templates/all.html", function() 
		{	
			Register.translationsHighlighter = new TranslationsHighlighter();
			Register.translationsHighlighter.init();

			Register.translationForm = new TranslationFormHandler();
			Register.translationForm.init();
			
			UIManager.addEvent(document.body, "mouseup", function(event, el) 
			{
				if (event.target.hasInParents("TR-NewWordForm") 
				|| event.target.hasInParents("TR-Hint"))
					return false;

				Register.translationsHighlighter.hideAllTranslationDetails();

				if (event.ctrlKey || event.metaKey)
				{
					Register.translationForm.display(event);
				}
				else 
				{
					Register.translationForm.dismiss();
				}
			});
		});
	};
};

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
		
		Register.settingsManager.GetTranslationLanguage(function (langTo)
		{
			Register.settingsManager.IsAutotranslationEnabled(function (autoTranslate)
			{
				_this.form = new TranslationForm(_this.formHandlerBody, {
					text: selectedText 
				}, langTo, autoTranslate);

				_this.form.setup(function(result) 
				{
					if (result.translation.length > 0)
					{
						Register.translationsManager.AddTranslation(result.text, result.translation, result.image, result.definition,
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