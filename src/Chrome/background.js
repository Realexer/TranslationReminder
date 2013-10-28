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
	}

	return true;
});

chrome.contextMenus.onClicked.addListener(function (info, tab)
{
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
	{
		chrome.tabs.sendMessage(tabs[0].id, { name: "Frontend.SetupNewWordAddingForm", word: info.selectionText }, function (response) { alert("Whoa: " + response); });
	});
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		title: "Highlight text...",
		contexts: ["selection"],
		id: "TR-AddNewWord"
	}, function () { console.log("Couldn't create context menu"); });
});