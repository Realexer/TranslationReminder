var BEMessagesHandler = [];
BEMessagesHandler[Messages.BE.DB.GetWords] = function(message, data, callback, sender) {
	Register.DB.GetWords(data, callback);
};
BEMessagesHandler[Messages.BE.DB.AddWord] = function(message, data, callback, sender) {
	Register.DB.AddWord(data, callback);
};
BEMessagesHandler[Messages.BE.DB.UpdateWordHitCount] = function(message, data, callback, sender) {
	Register.DB.UpdateWordHitCount(data, callback);
};
BEMessagesHandler[Messages.BE.DB.DeleteWord] = function(message, data, callback, sender) {
	Register.DB.DeleteWord(data, callback);
};
BEMessagesHandler[Messages.BE.DB.SetWordLearned] = function(message, data, callback, sender) {
	Register.DB.SetWordLearned(data, callback);
};
BEMessagesHandler[Messages.BE.DB.DeleteAllWords] = function(message, data, callback, sender) {
	Register.DB.DeleteAllWords(callback);
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
		word: info.selectionText 
	}, function() {});
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		title: "Highlight text...",
		contexts: ["selection"],
		id: Messages.FE.DisplayTranslationForm,
	}, function () { console.log("Couldn't create context menu for 'Add New Word'"); });
	
	chrome.contextMenus.create({
		title: "Don't highlight text on this site",
		contexts: ["all"],
		id: Messages.FE.AddSiteToBlackList,
	}, function () { console.log("Couldn't create context menu for 'Disable Highlighting function'"); });
});
