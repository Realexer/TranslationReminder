var frontend = new Frontend();

frontend.Init();


Messanger.onMessage(function (message, sender, callback)
{
	switch (message.name)
	{
		case Messages.TR.SetupNewWordAddingForm:
			Register.translationsAddingForm.SetupNewWordAddingForm();
			callback();
			break;

		case Messages.TR.AddSiteToBlackList:
			Messanger.sendMessage({ 
				name: Messages.DB.AddSiteToBlackList, 
				data: { 
					site: document.domain
				}
			},
			function () {
				callback();
			});
			Register.translationsHighlighter.RemoveHighLights(null)
			break;
	}
});