var SynchStorage = function() 
{
	var _keys = {
		translations: "translations",
		settings: "settings",
		synchash: "synchash",
		
		sqlDataImported: "sqlDataImported"
	};
	
	var _this = this;
	this.sync = null;
	this.local = null;
	
	this.init = function() 
	{
		this.sync = chrome.storage.sync;
		//this.sync.remove([_keys.translations, _keys.settings]);
		this.local = chrome.storage.local;
		
		chrome.storage.onChanged.addListener(function(changes, namespace) 
		{
			for (var key in changes) 
			{
				if(key == _keys.translations) 
				{
					_this.local.get(_keys.synchash, function(localHash) {
						_this.sync.get(_keys.synchash, function(syncHash) {
							if(localHash[_keys.synchash] != syncHash[_keys.synchash]) 
							{
								console.log("Translations sync required");
							}
						});
					});
				}
			}
		});
	};
	
	function setData(key, value) 
	{
		var data = {};
		data[key] = value;
		
		return data;
	};
	
	this.synchTranslations = function(callback) 
	{
		Register.translationsManager.GetTranslations(function(translations) {
			_this.setTranslations(translations, callback);
		});
	};
	
	this.setTranslations = function(translations, callback) 
	{
		var syncHash = generateRundomString(10);
		this.local.set(setData(_keys.synchash, syncHash), function() {
			_this.sync.set(setData(_keys.synchash, syncHash), function() {
				_this.sync.set(setData(_keys.translations, JSON.stringify(translations)), function() 
				{
					callback();
				});
			});
		});
	};
	
	this.getTranslations = function(callback) 
	{
		return this.sync.get(_keys.translations, function(result) {
			callback(JSON.parse(result[_keys.translations]));
		});
	};
	
	this.getSettings = function(callback) 
	{
		this.sync.get(_keys.settings, function(res) {
			callback(res[_keys.settings]);
		});
	};
	
	this.setSettings = function(settings, callback) 
	{
		this.sync.set(setData(_keys.settings, settings), callback);
	};
	
	
	this.updateSetting = function(key, value, callback) 
	{
		this.getSettings(function(settings) {
			settings[key] = value;
			_this.setSettings(settings, callback);
		});
	};
	
	
	this.isSqlDataImported = function(callback) 
	{
		this.sync.get(_keys.sqlDataImported, function(res) {
			return callback(res[_keys.sqlDataImported]);
		});
	};
	
	this.setSqlDataImported = function(value, callback) 
	{
		this.sync.set(setData(_keys.sqlDataImported, value), callback);
	};
};

Register.synchStorage = new SynchStorage();
Register.synchStorage.init();