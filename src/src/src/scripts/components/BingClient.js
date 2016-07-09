var BingClient = function ()
{
	this.Translate = function (text, fromLang, toLang, callback)
	{
		Ajax.Invoke(
		{
			url: AppConfig.bingAPI.url + AppConfig.bingAPI.methods.Translate,
			data: {
				appId: AppConfig.bingAPI.appId,
				from: fromLang,
				to: toLang,
				text: text
			}
		}, callback);	
	};

	this.GetSupportedLangs = function (callback)
	{
		Ajax.Invoke(
		{
			url: AppConfig.bingAPI.url + AppConfig.bingAPI.methods.GetLangsList,
			data: {
				appId: AppConfig.bingAPI.appId
			}
		},
		function (result)
		{
			callback(JSON.parse(result));
		}
	);
	};
};
