var FEMessageHandlers = [];
FEMessageHandlers[Messages.FE.DisplayTranslationForm] = function(message, data, callback, sender) 
{
	Register.translationFormHandler.display();
	callback();
};

FEMessageHandlers[Messages.FE.AddSiteToBlackList] = function(message, data, callback, sender) 
{
	Register.settingsManager.AddSiteToBlackList(document.domain, function() 
	{
		callback();
		Register.translationsHighlighter.removeAllHighlights();
	});
};

Messanger.onMessage(function (message, data, callback, sender)
{
	if(FEMessageHandlers[message]) {
		FEMessageHandlers[message](message, data, callback, sender);
	}
});

var browserPage = new BrowserPage();
browserPage.Init();