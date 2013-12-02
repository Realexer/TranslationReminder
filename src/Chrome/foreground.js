var frontend = new Frontend();

frontend.Init();


chrome.runtime.onMessage.addListener(function (message, sender, callback)
{
	switch (message.name)
	{
		case "Frontend.SetupNewWordAddingForm":
			frontend.SetupNewWordAddingForm();
			callback();
			break;

		case "Foreground.AddSiteToBlackList":
			chrome.runtime.sendMessage({ name: "DB.AddSiteToBlackList", data: { site: document.domain} }, function () {
				callback();
			});
			frontend.RemoveHighLights(null);
			break;
	}

	return true;
});