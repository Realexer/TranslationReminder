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

FEMessageHandlers[Messages.FE.GetSiteInfo] = function(message, data, callback, sender) 
{
	Register.settingsManager.GetSiteLanguage(document.domain, function(lang) {
		callback({
			domain: document.domain,
			lang: OR(lang, document.documentElement.lang),
		});
	});
};

FEMessageHandlers[Messages.FE.ShowHighlights] = function(message, data, callback, sender) 
{
	window.location.reload();
	callback();
};

FEMessageHandlers[Messages.FE.RemoveHighlights] = function(message, data, callback, sender) 
{
	window.location.reload();
	callback();
};

FEMessageHandlers[Messages.FE.SwitchReplacingHighlightsWithTranslations] = function(message, data, callback, sender) 
{
	if(Register.translationsHighlighter) 
	{
		Register.translationsHighlighter.switchReplacingHighlightsWithTranslation();
		callback();
	}
};

Messanger.onMessage(function (message, data, callback, sender)
{
	if(FEMessageHandlers[message]) {
		FEMessageHandlers[message](message, data, callback, sender);
	}
});

Register.browserPage = new BrowserPage();
Register.browserPage.Init();