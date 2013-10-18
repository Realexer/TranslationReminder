chrome.extension.onMessage.addListener(function (message, sender, callback)
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

		default:
			console.log("Message wasn't handled: Name=" + message.name);
			console.log(message);
			console.log(sender);
			console.log(callback);
			return false;
	}

	return true;
});