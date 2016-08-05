var BEMessagesHandler = [];
BEMessagesHandler[Messages.BE.DB.GetTranslations] = function(message, data, callback, sender) {
	Register.DB.GetTranslations(data, callback);
};
BEMessagesHandler[Messages.BE.DB.GetTranslationByText] = function(message, data, callback, sender) {
	Register.DB.getTranslationByText(data, callback);
};
BEMessagesHandler[Messages.BE.DB.AddTranslation] = function(message, data, callback, sender) {
	Register.DB.AddTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.UpdateTranslation] = function(message, data, callback, sender) {
	Register.DB.UpdateTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.DeleteTranslation] = function(message, data, callback, sender) {
	Register.DB.DeleteTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.DeleteAllTranslations] = function(message, data, callback, sender) {
	Register.DB.DeleteAllTranslations(callback);
};

Messanger.onMessage(function(message, data, callback, sender) 
{
	if(BEMessagesHandler[message]) {
		BEMessagesHandler[message](message, data, callback, sender);
	}
});

chrome.contextMenus.onClicked.addListener(function (info, tab)
{
	Messanger.sendMessageToTab(tab.id, info.menuItemId,
	{
		text: info.selectionText 
	}, function() {});
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		title: "Highlight text...",
		contexts: ["selection"],
		id: Messages.FE.DisplayTranslationForm,
	}, function () { console.log("Couldn't create context menu for 'Add New Translation'"); });
});
