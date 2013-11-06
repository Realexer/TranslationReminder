var BingClient = function ()
{
	this.config = {
		methods: {
			Translate: "Translate",
			GetLangsList: "GetLanguagesForTranslate"
		},
		params: {
			appId: "8E54095330F0B7E7CB73527A50437E6110A64730"
		}
	};

	this.Translate = function (text, callback)
	{
		var bingClient = this;
		new Ajax().Invoke(
			{
				url: "http://api.microsofttranslator.com/V2/Ajax.svc/" + bingClient.config.methods.Translate,
				data: {
					"appId": bingClient.config.params.appId,
					"to": "ru",
					"text": text
				}
			},
			callback
		);
	};

	this.GetSupportedLangs = function(callback)
	{
		var bingClient = this;
		new Ajax().Invoke(
			{
				url: "http://api.microsofttranslator.com/V2/Ajax.svc/" + bingClient.methods.GetLangsList,
				data: {
					"appId": bingClient.params.appId
				}
			},
			callback
		);
	};
};
