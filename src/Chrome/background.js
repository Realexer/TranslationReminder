Messanger.onMessage(function(message, sender, callback) 
{
	switch (message.name)
	{
		case Messages.DB.GetWords:
			Register.DB.GetWords(message.data.order, message.data.direction, function (words)
			{
				callback(words);
			});
			break;

		case Messages.DB.AddWord:
			Register.DB.AddWord(message.data.word, message.data.translation, message.data.date, function ()
			{
				callback();
			});
			break;

		case Messages.DB.UpdateWordHitCount:
			Register.DB.UpdateWordHitCount(message.data.word, message.data.hits, function ()
			{
				callback();
			});
			break;

		case Messages.DB.DeleteWord:
			Register.DB.DeleteWord(message.data.word, function ()
			{
				callback();
			});
			break;
		
		case Messages.DB.DeleteAllWords:
			Register.DB.DeleteAllWords(function ()
			{
				callback();
			});
			break;

		case Messages.DB.GetSitesBlackList:
			Register.DB.GetSitesBlackList(function (sites)
			{
				callback(sites);
			});
			break;

		case Messages.DB.AddSiteToBlackList:
			Register.DB.AddSiteToBlackList(message.data.site, function ()
			{
				callback();
			});
			break;

		case Messages.DB.GetAllSettings:
			Register.DB.GetAllSettings(function (settings)
			{
				callback(settings);
			});
			break;

		case Messages.DB.SetSetting:
			Register.DB.SetSetting(message.data.key, message.data.value, function (value)
			{
				callback(value);
			});
			break;
	}
});

chrome.contextMenus.onClicked.addListener(function (info, tab)
{
//	chrome.getCurrent(function (tab)
//	{
		Messanger.sendMessageToTab(tab.id,
		{
			name: info.menuItemId, 
			word: info.selectionText 
		}, function() {});
//	});
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		title: "Highlight text...",
		contexts: ["selection"],
		id: Messages.TR.SetupNewWordAddingForm,
	}, function () { console.log("Couldn't create context menu for 'Add New Word'"); });
	
	chrome.contextMenus.create({
		title: "Don't highlight text on this site",
		contexts: ["all"],
		id: Messages.TR.AddSiteToBlackList,
	}, function () { console.log("Couldn't create context menu for 'Disable Highlighting function'"); });
});
