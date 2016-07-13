var AppConfig = 
{
	initialSettings: 
	{
		SitesBlackList: "",
		TranslationLanguage: "en",
		AutoTranslationEnabled: true
	},
	
	bingAPI: {
		url: "https://api.microsofttranslator.com/V2/Ajax.svc/",
		methods: {
			Translate: "Translate",
			GetLangsList: "GetLanguagesForTranslate"
		},
		appId: "8E54095330F0B7E7CB73527A50437E6110A64730"
	},
	
	restrictedTags: [
		"trtag",
		"style", 
		"script", 
		"object", 
		"embed", 
		"textarea", 
		"button", 
		"select", 
		"option",
		"input", 
		"checkbox"
	]
};

var Messages = 
{
	FE: {
		DisplayTranslationForm: "FE.DisplayTranslationForm",
		AddSiteToBlackList: "FE.AddSiteToBlackList"
	},
	BE: {
		DB: 
		{
			GetWords: "BE.DB.GetWords",
			AddWord: "BE.DB.AddWord",
			UpdateWordHitCount: "BE.DB.UpdateWordHitCount",
			DeleteWord: "BE.DB.DeleteWord",
			DeleteAllWords: "BE.DB.DeleteAllWords",
			GetSitesBlackList: "BE.DB.GetSitesBlackList",
			AddSiteToBlackList: "BE.DB.AddSiteToBlackList",
			GetAllSettings: "BE.DB.GetAllSettings",
			SetSetting: "BE.DB.SetSetting"
		}
	}
};

var Messanger = 
{
	sendMessage: function(message, data, callback) 
	{
		chrome.runtime.sendMessage({
			name: message,
			data: data
		}, callback);
	},
	sendMessageToTab: function(tabId, message, callback) 
	{
		chrome.tabs.sendMessage(tabId, message, callback);
	},
	onMessage: function(handler) 
	{
		chrome.runtime.onMessage.addListener(function (message, sender, callback)
		{
			handler(message.name, message.data, callback, sender);
			return true;
		});
	}
};

var TemplatesLoader = 
{
	loadTemplates: function(url, callback) 
	{
		Ajax.Invoke({
			type: "GET",
			url: chrome.extension.getURL(url)
		},
		function(html) 
		{
			UIManager.addNodeFromHTML(document.body, html);
			Initer.whenTrue(function() {
				return getEl("tr-templates") != null;
			}, function() 
			{
				Register.templater = new Templater();
				Register.templater.prepareUI();
				
				callback();
			});
		});
	}
};

var WordsOrder = 
{
	order: {
		word: "word",
		date: "date",
		hits: "hits"
	},
	direction: {
		ASC: "ASC",
		DESC: "DESC"
	}
};
