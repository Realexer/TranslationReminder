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
		
	};
	
	function getSetting(key, _default, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.GetAllSettings, null, function (settings)
		{
			if (settings[key])
				_default = settings[key];
			
			callback(_default);
		});
	}
	
	function saveSetting(key, value, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.SetSetting, {
			key: key,
			value: value
		}, callback);
	}
	
	this.GetSitesBlackList = function (callback)
	{
		getSetting(settingsKeys.SitesBlackList, "", function(value) {
			callback(value.split(";"));
		});
	};
	
	this.ifSiteNotInBlackList = function(domain, callback) 
	{
		Register.settingsManager.GetSitesBlackList(function(sites) 
		{
			if (sites.indexOf(domain) === -1)
			{
				callback();
			}
		});
	};

	this.UpdateSitesBlackList = function (sites, callback)
	{
		saveSetting(settingsKeys.SitesBlackList, sites.RemoveDuplicates().TrimAllElements().join(";"), callback);
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
		getSetting(settingsKeys.AutoTranslatioinEnabled, Props.defaults.AutoTranslationEnabled, 
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
		getSetting(settingsKeys.TranslationLanguage, Props.defaults.TranslationLanguage, 
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