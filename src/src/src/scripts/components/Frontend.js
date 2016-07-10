var Frontend = function ()
{
	var _this = this;
	
	this.Init = function ()
	{
		TemplatesLoader.loadTemplates("templates/frontend.html", function() 
		{	
			Register.translationsHighlighter = new TranslationsHighlighter();
			Register.translationsHighlighter.init();

			Register.translationsForm = new TranslationsForm();
			Register.translationsForm.init();
			
			UIManager.addEvent(document.body, "mouseup", function(event, el) 
			{
				if (event.target.hasInParents("TR-NewWordForm") 
				|| event.target.hasInParents("TR-Hint"))
					return false;

				Register.translationsHighlighter.hideAllTranslationDetails();

				if (event.ctrlKey || event.metaKey)
				{
					Register.translationsForm.display(event);
				}
				else 
				{
					Register.translationsForm.hideNewWordAddingForm();
				}
			});
		});
	};
};