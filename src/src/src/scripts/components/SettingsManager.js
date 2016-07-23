var SettingsManager = function() 
{
	var _this = this;
	
	var settingsKeys =
	{
		SitesBlackList: "SitesBlackList",
		AutoTranslatioinEnabled: "AutoTranslationEnabled",
		TranslationLanguage: "TranslationLanguage"
	};
	
	this.init = function() 
	{
		inportOrSetDefaultSettings();
	};
	
	function inportOrSetDefaultSettings() 
	{
		Register.synchStorage.getSettings(function(res) 
		{
			if(!res) 
			{
				Register.sqlStorage.GetAllSettings(function(settings) // get settings from previous version
				{
					var defaultSettings = {
						SitesBlackList: OR(settings[settingsKeys.SitesBlackList], AppConfig.initialSettings.SitesBlackList),
						AutoTranslatioinEnabled: OR(settings[settingsKeys.AutoTranslationEnabled], AppConfig.initialSettings.AutoTranslationEnabled),
						TranslationLanguage: OR(settings[settingsKeys.TranslationLanguage], AppConfig.initialSettings.TranslationLanguage),
					};
					
					Register.setSettings(defaultSettings);
				});
			}
		});
	};
	
	function getSetting(key, callback) 
	{
		return Register.synchStorage.getSettings(function(settings) {
			if (settings[key])
				_default = settings[key];
			
			callback(_default);
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
	
	this.GetSitesBlackList = function (callback)
	{
		getSetting(settingsKeys.SitesBlackList, function(value) {
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
		saveSetting(settingsKeys.SitesBlackList, sites.RemoveDuplicates().TrimAllElements(), callback);
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
		getSetting(settingsKeys.AutoTranslatioinEnabled, 
		function(value) {
			return callback(getBool(value));
		});
	};
	
	this.setAutoTranslationEnabled = function(value, callback) 
	{
		saveSetting(settingsKeys.AutoTranslatioinEnabled, getBool(value), callback);
	};

	this.GetTranslationLanguage = function (callback)
	{
		getSetting(settingsKeys.TranslationLanguage, 
		function(lang) {
			return callback(lang);
		});
	};

	this.SetTranslationLanguage = function (lang, callback)
	{
		saveSetting(settingsKeys.TranslationLanguage, lang, callback);
	};
};

Register.settingsManager = new SettingsManager();
Register.settingsManager.init();