var GlosbeClient = 
{
	Translate: function (text, fromLang, toLang, callback)
	{
		Ajax.Invoke(
		{
			url: AppConfig.glosbeAPI.url + AppConfig.glosbeAPI.methods.translate,
			type: "GET",
			data: {
				from: fromLang,
				dest: toLang,
				phrase: text,
				format: "json",
				pretty: "true"
			}
		}, function(result) {
			return callback(JSON.parse(result));
		});
	}
};
