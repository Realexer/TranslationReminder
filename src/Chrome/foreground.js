var FEMessageHandlers = [];
FEMessageHandlers[Messages.FE.DisplayTranslationForm] = function(message, data, callback, sender) 
{
	Register.translationForm.display();
	callback();
};

FEMessageHandlers[Messages.FE.AddSiteToBlackList] = function(message, data, callback, sender) 
{
	Messanger.sendMessage({ 
		name: Messages.BE.DB.AddSiteToBlackList, 
		data: { 
			site: document.domain
		}
	},
	function () {
		callback();
	});
	Register.translationsHighlighter.RemoveHighLights(null)
};

Messanger.onMessage(function (message, data, callback, sender)
{
	if(FEMessageHandlers[message]) {
		FEMessageHandlers[message](message, data, callback, sender);
	}
});

var frontend = new Frontend();
frontend.Init();