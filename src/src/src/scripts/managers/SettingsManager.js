var SettingsManager = function() 
{
	var _this = this;
	
	this.init = function() 
	{
		
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
	
	this.isSiteBlacklisted = function(domain, callback) 
	{
		this.GetSitesBlackList(function(sites) 
		{
			var isBlacklisted = false;
			performOnElsList(sites, function(site) {
				if(domain.indexOf(site) !== -1) {
					isBlacklisted = true;
				}
			});
			
			callback(isBlacklisted);
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
	
	this.RemoveSiteToBlackList = function (site, callback)
	{
		this.GetSitesBlackList(function (sites)
		{
			var index = sites.indexOf(site);
			sites.splice(index, 1);
			_this.UpdateSitesBlackList(sites, callback);
		});
	};

	this.IsAutotranslationEnabled = function (callback)
	{
		getSetting(SettingsKeys.AutoTranslationEnabled, 
		function(value) {
			return callback(getBool(value));
		});
	};
	
	this.setAutoTranslationEnabled = function(value, callback) 
	{
		saveSetting(SettingsKeys.AutoTranslationEnabled, getBool(value), callback);
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
	
	this.GetRestrictedTags = function(callback) 
	{
		getSetting(SettingsKeys.RestrictedTags, 
		function(tags) {
			return callback(tags);
		});
	};
	
	this.SetSiteLanguage = function(domain, lang, callback) 
	{
		getSetting(SettingsKeys.SiteLanguage, function(sites) 
		{
			sites[domain] = lang;
			saveSetting(SettingsKeys.SiteLanguage, sites, callback);
		});
	};
	
	this.GetSiteLanguage = function(domain, callback) 
	{
		getSetting(SettingsKeys.SiteLanguage, function(sites) {
			callback(sites[domain]);
		});
	};
};

Register.settingsManager = new SettingsManager();
Register.settingsManager.init();

var SettingsKeys =
{
	SitesBlackList: "SitesBlackList",
	AutoTranslationEnabled: "AutoTranslationEnabled",
	SourceLanguage: "SourceLanguage",
	TranslationLanguage: "TranslationLanguage",
	HighlightStyling: "HighlightStyling",
	RestrictedTags: "RestrictedTags",
	SiteLanguage: "SiteLanguage"
};

var HighlightStylingKeys =  
{
	addBackgroundColor: "addBackgroundColor",
	backgroundColor: "backgroundColor",
	addShaddow: "addShaddow",
	addUnderline: "addUnderline",
	customCSS: "customCSS"
};