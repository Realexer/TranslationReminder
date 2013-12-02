chrome.runtime.onMessage.addListener(function (message, sender, callback)
{
	switch (message.name)
	{
		case "DB.GetWords":
			new DB().GetWords(function (words)
			{
				callback(words);
			});
			break;

		case "DB.AddWord":
			new DB().AddWord(message.data.word, message.data.translation, null, function ()
			{
				callback();
			});
			break;

		case "DB.UpdateWordHitCount":
			new DB().UpdateWordHitCount(message.data.word, message.data.hits, null, function ()
			{
				callback();
			});
			break;

		case "DB.DeleteWord":
			new DB().DeleteWord(message.data.word, function ()
			{
				callback();
			});
			break;

		case "DB.GetSitesBlackList":
			new DB().GetSitesBlackList(function (sites)
			{
				callback(sites);
			});
			break;

		case "DB.AddSiteToBlackList":
			new DB().AddSiteToBlackList(message.data.site, function ()
			{
				callback();
			});
			break;

		case "DB.IsAutotranslationEnabled":
			new DB().IsAutotranslationEnabled(function (isEnabled)
			{
				callback(isEnabled);
			});
			break;

		case "DB.GetTranslationLanguage":
			new DB().GetTranslationLanguage(function (lang)
			{
				callback(lang);
			});
			break;
	}

	return true;
});

chrome.contextMenus.onClicked.addListener(function (info, tab)
{
	switch (info.menuItemId)
	{
		case "TR-AddNewWord":
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
			{
				chrome.tabs.sendMessage(tabs[0].id, { name: "Frontend.SetupNewWordAddingForm", word: info.selectionText }, function () { });
			});
			break;

		case "TR-DisableWordHighlightingOnTheSite":
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
			{
				chrome.tabs.sendMessage(tabs[0].id, { name: "Foreground.AddSiteToBlackList", word: info.selectionText }, function () {});
			});
			break;

		default:
	}
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		title: "Highlight text...",
		contexts: ["selection"],
		id: "TR-AddNewWord"
	}, function () { console.log("Couldn't create context menu for 'Add New Word'"); });
	
	chrome.contextMenus.create({
		title: "Don't highlight text on this site",
		contexts: ["all"],
		id: "TR-DisableWordHighlightingOnTheSite"
	}, function () { console.log("Couldn't create context menu for 'Disable Highlighting function'"); });
});
