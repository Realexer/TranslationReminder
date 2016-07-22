var BEMessagesHandler = [];
BEMessagesHandler[Messages.BE.DB.GetTranslations] = function(message, data, callback, sender) {
	Register.DB.GetTranslations(data, callback);
};
BEMessagesHandler[Messages.BE.DB.AddTranslation] = function(message, data, callback, sender) {
	Register.DB.AddTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.EditTranslation] = function(message, data, callback, sender) {
	Register.DB.EditTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.SetTranslationHitsCount] = function(message, data, callback, sender) {
	Register.DB.SetTranslationHitsCount(data, callback);
};
BEMessagesHandler[Messages.BE.DB.DeleteTranslation] = function(message, data, callback, sender) {
	Register.DB.DeleteTranslation(data, callback);
};
BEMessagesHandler[Messages.BE.DB.SetTextLearned] = function(message, data, callback, sender) {
	Register.DB.SetTextLearned(data, callback);
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
	Messanger.sendMessageToTab(tab.id,
	{
		name: info.menuItemId, 
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
	
	chrome.contextMenus.create({
		title: "Don't highlight text on this site",
		contexts: ["all"],
		id: Messages.FE.AddSiteToBlackList,
	}, function () { console.log("Couldn't create context menu for 'Disable Highlighting function'"); });
});
