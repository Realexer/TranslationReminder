var AppConfig = 
{
	manifest: chrome.runtime.getManifest(),
	production: true,
	
	initialSettings: 
	{
		SitesBlackList: [],
		SourceLanguage: "en",
		TranslationLanguage: "en",
		AutoTranslationEnabled: true,
		HighlightStyling: {
			addBackgroundColor: false,
			backgroundColor: "",
			addShaddow: false,
			addUnderline: true,
			customCSS: ""
		},
		RestrictedTags: [
			
		],
		ReplacingHighlightsWithTranslationEnabled: false
	},
	
	restrictedTags: [
		"trtag",
		"head",
		"noscript",
		"style", 
		"script", 
		"object", 
		"embed", 
		"textarea", 
		"button", 
		"select", 
		"option",
		"input", 
		"checkbox",
		"canvas"
	],
	
	glosbeAPI: {
		url: "https://glosbe.com/gapi/",
		methods: {
			translate: "translate"
		}
	},
	
	bingAPI: {
		url: "https://api.microsofttranslator.com/V2/Ajax.svc/",
		methods: {
			Translate: "Translate",
			GetLangsList: "GetLanguagesForTranslate"
		},
		appId: "8E54095330F0B7E7CB73527A50437E6110A64730",
	},
	bingAPIv2: {
		url: "https://api.datamarket.azure.com/Bing/Search/",
		methods: {
			Image: "Image"
		},
		accountId: "uzo4aDuoHBH44J7X2kzXzU+ElWr+HbdxVyS6or56poQ="
	},
	
	translationForm: {
		imagesToShow: 10,
		textMaxWordsToTranslate: {
			bing: 5,
			glosbe: 3
		}
	},
	images: {
		selectTextImage: chrome.extension.getURL('imgs/4.0/placeholder-select.png'),
		noTextImage: chrome.extension.getURL('imgs/4.0/placeholder.png'),
		bingIcon: chrome.extension.getURL('imgs/bing_icon.png'),
		glosbeIcon: chrome.extension.getURL('imgs/glosbe_icon.png'),
		loadingAnimation: chrome.extension.getURL('imgs/loading.gif')
	}
};

var Messages = 
{
	FE: {
		DisplayTranslationForm: "FE.DisplayTranslationForm",
		AddSiteToBlackList: "FE.AddSiteToBlackList",
		GetSiteInfo: "FE.GetSiteInfo",
		SetSiteLang: "FE.SetSiteLang",
		ShowHighlights: "FE.ShowHighlights",
		RemoveHighlights: "FE.RemoveHighlights",
		SwitchReplacingHighlightsWithTranslations: "SwitchReplacingHighlightsWithTranslations",
	},
	BE: {
		DB: 
		{
			GetTranslations: "BE.DB.GetTranslations",
			GetTranslationByText: "BE.DB.GetTranslationByText",
			AddTranslation: "BE.DB.AddTranslation",
			UpdateTranslation: "BE.DB.UpdateTranslation",
			DeleteTranslation: "BE.DB.DeleteTranslation",
			DeleteAllTranslations: "BE.DB.DeleteAllTranslations",
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
	sendMessageToTab: function(tabId, message, data, callback) 
	{
		chrome.tabs.sendMessage(tabId, {
			name: message,
			data: data	
		}, callback);
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
	loadTemplates: function(url, intoEl, callback) 
	{
		TemplatesLoader.loadFile(url, function(html) 
		{
			var templatesHandler = UIManager.addNodeFromHTML(intoEl, html);
			Initer.whenTrue(function() {
				return getEl("tr-templates") != null;
			}, function() 
			{
				TemplatesLoader.initTemplater();
				
				UIManager.removeEl(templatesHandler);
				
				callback();
			});
		});
	},
	
	loadFile: function(url, callback) 
	{
		Ajax.Invoke({
			type: "GET",
			url: chrome.extension.getURL(url)
		},
		function(html) 
		{
			callback(html);
		});
	},
	
	initTemplater: function() 
	{
		Register.templater = new Templater();
		Register.templater.templatesDeclarationAttr = "data-tr-js-template";
		Register.templater.templatesUsageAttr = "data-tr-js-use-template";
		Register.templater.templatesUsageDataAttr = "data-tr-js-template-data";

		Templater.UI.dataAttributes.checked = "data-tr-checked";
		Templater.UI.dataAttributes.selected = "data-tr-selected";
		Templater.UI.dataAttributes.src = "data-tr-src";

		Templater.UI.init();

		Register.templater.prepareUI(document);
	}
};

var TranslationsOrder = 
{
	order: {
		text: "text",
		date: "date",
		hits: "hits"
	},
	direction: {
		ASC: "ASC",
		DESC: "DESC"
	}
};
