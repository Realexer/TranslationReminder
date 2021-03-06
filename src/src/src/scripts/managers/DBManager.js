var DBManager = function() 
{
	var _this = this;
	
	this.init = function() 
	{
		importSQLdataToIndexedDB();
		inportOrSetDefaultSettings();
	};
	
	function importSQLdataToIndexedDB() 
	{
		Initer.whenTrue(function() {
			return Register.indexedStorage.ready;
		}, function() 
		{
			Register.synchStorage.isSqlDataImported(function(isImported) 
			{
				if(!isImported) 
				{
					Register.sqlStorage.GetWords(TranslationsOrder.order.date, TranslationsOrder.direction.DESC, function(words) 
					{
						performOnElsList(words, function(word, i) 
						{
							Register.indexedStorage.AddTranslation(TranslationAdapter.getFromExisting({
								text: word.word, 
								translation: word.translation,
								date: word.date,
								hits: word.hits,
								learned: false
							}).getData(), function() 
							{
								if(i == words.length-1) 
								{
									Register.synchStorage.setSqlDataImported(true);
									Register.synchStorage.synchDictionary();
								}
							});
						});
					});
				}
				else 
				{
					Register.synchStorage.copyDictionaryToDB();
				}
			});
		}, 1000);
	};
	
	function inportOrSetDefaultSettings() 
	{
		Register.synchStorage.getSettings(function(res) 
		{
			if(!res || res.length == 0) 
			{
				Register.sqlStorage.GetAllSettings(function(settings) // get settings from previous version
				{
					settings = OR(settings, {});
					var sitesBlankList = null;
					if(settings[SettingsKeys.SitesBlackList]) 
					{
						sitesBlankList = settings[SettingsKeys.SitesBlackList].split(";").TrimAllElements();
					}
					
					var defaultSettings = {
						SitesBlackList: OR(sitesBlankList, AppConfig.initialSettings.SitesBlackList),
						AutoTranslationEnabled: OR(settings[SettingsKeys.AutoTranslationEnabled], AppConfig.initialSettings.AutoTranslationEnabled),
						SourceLanguage: AppConfig.initialSettings.SourceLanguage,
						TranslationLanguage: OR(settings[SettingsKeys.TranslationLanguage], AppConfig.initialSettings.TranslationLanguage),
						HighlightStyling: AppConfig.initialSettings.HighlightStyling,
						RestrictedTags: AppConfig.initialSettings.RestrictedTags,
						ReplacingHighlightsWithTranslationEnabled: AppConfig.initialSettings.ReplacingHighlightsWithTranslationEnabled,
						SiteLanguage: {}
					};
					
					Register.synchStorage.setSettings(defaultSettings);
				});
			}
		});
	};
};

Register.dbManager = new DBManager();

Register.DB = Register.indexedStorage;