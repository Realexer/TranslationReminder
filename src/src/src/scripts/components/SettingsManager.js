var SettingsManager = function() 
{
	var _this = this;
	
	this.init = function() 
	{
		inportOrSetDefaultSettings();
	};
	
	function inportOrSetDefaultSettings() 
	{
		Register.synchStorage.getSettings(function(res) 
		{
			if(!res || res.length == 0) 
			{
				Register.sqlStorage.GetAllSettings(function(settings) // get settings from previous version
				{
					var defaultSettings = {
						SitesBlackList: OR(settings[SettingsKeys.SitesBlackList].split(";").TrimAllElements(), AppConfig.initialSettings.SitesBlackList),
						AutoTranslatioinEnabled: OR(settings[SettingsKeys.AutoTranslationEnabled], AppConfig.initialSettings.AutoTranslationEnabled),
						TranslationLanguage: OR(settings[SettingsKeys.TranslationLanguage], AppConfig.initialSettings.TranslationLanguage),
						HighlightStyling: OR(settings[SettingsKeys.HighlightStyling], AppConfig.initialSettings.HighlightStyling)
					};
					
					Register.synchStorage.setSettings(defaultSettings);
				});
			}
		});
	};
	
	function getSetting(key, callback) 
	{
		return Register.synchStorage.getSettings(function(settings) {
			callback(settings[key]);
		});
	}
	
	function saveSetting(key, value, callback) 
	{
		return Register.synchStorage.updateSetting(key, value, function() {
			if (callback) {
				callback();
			}
		});
	}
	
	this.getSettings = function(callback) 
	{
		return Register.synchStorage.getSettings(function(settings) {
			callback(settings);
		});
	};
	
	this.saveSettings = function(settings, callback) 
	{
		return Register.synchStorage.setSettings(settings, callback);
	};
	
	this.GetSitesBlackList = function (callback)
	{
		getSetting(SettingsKeys.SitesBlackList, function(value) {
			callback(value);
		});
	};
	
	this.ifSiteNotInBlackList = function(domain, callback) 
	{
		this.GetSitesBlackList(function(sites) 
		{
			var isBlacklisted = false;
			performOnElsList(sites, function(site) {
				if(domain.indexOf(site) !== -1) {
					isBlacklisted = true;
				}
			});
			
			if (!isBlacklisted)
			{
				callback();
			}
		});
	};

	this.UpdateSitesBlackList = function (sites, callback)
	{
		saveSetting(SettingsKeys.SitesBlackList, sites.RemoveDuplicates().TrimAllElements().filter(function(item) {
			return !UIFormat.isEmptyString(item);
		}), callback);
	};

	this.AddSiteToBlackList = function (site, callback)
	{
		this.GetSitesBlackList(function (sites)
		{
			sites.push(site);
			_this.UpdateSitesBlackList(sites, callback);
		});
	};

	this.IsAutotranslationEnabled = function (callback)
	{
		getSetting(SettingsKeys.AutoTranslatioinEnabled, 
		function(value) {
			return callback(getBool(value));
		});
	};
	
	this.setAutoTranslationEnabled = function(value, callback) 
	{
		saveSetting(SettingsKeys.AutoTranslatioinEnabled, getBool(value), callback);
	};

	this.GetTranslationLanguage = function (callback)
	{
		getSetting(SettingsKeys.TranslationLanguage, 
		function(lang) {
			return callback(lang);
		});
	};

	this.SetTranslationLanguage = function (lang, callback)
	{
		saveSetting(SettingsKeys.TranslationLanguage, lang, callback);
	};
	
	this.GetHighlightStyling = function (callback)
	{
		getSetting(SettingsKeys.HighlightStyling, 
		function(lang) {
			return callback(lang);
		});
	};

	this.SetHighlightStyling = function (styling, callback)
	{
		saveSetting(SettingsKeys.HighlightStyling, styling, callback);
	};
};

Register.settingsManager = new SettingsManager();
Register.settingsManager.init();

var SettingsKeys =
{
	SitesBlackList: "SitesBlackList",
	AutoTranslatioinEnabled: "AutoTranslationEnabled",
	TranslationLanguage: "TranslationLanguage",
	HighlightStyling: "HighlightStyling"
};

var HighlightStylingKeys =  
{
	addBackgroundColor: "addBackgroundColor",
	backgroundColor: "backgroundColor",
	addShaddow: "addShaddow",
	addUnderline: "addUnderline",
	customCSS: "customCSS"
};