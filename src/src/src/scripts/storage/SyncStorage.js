var SynchStorage = function() 
{
	var _keys = {
		dicitonary: "dictionary",
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
		//this.sync.remove([_keys.dictionary, _keys.settings]);
		this.local = chrome.storage.local;
		
		chrome.storage.onChanged.addListener(function(changes, namespace) 
		{
			for (var key in changes) 
			{
				if(key == _keys.dicitonary) 
				{
					_this.local.get(_keys.synchash, function(localHash) {
						_this.sync.get(_keys.synchash, function(syncHash) {
							if(localHash[_keys.synchash] != syncHash[_keys.synchash]) 
							{
								_this.getDictionary(function(dic) 
								{
									Register.indexedStorage.setTranslations(dic, function() {
										console.log("Dicitonary synched.");
									});
								});	
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
	
	var synchTimer = null;
	
	this.synchDictionary = function(callback) 
	{
		// Scheduling synch to prevent excessive number of writes
		if(synchTimer) {
			Timeout.reset(synchTimer);
		}
		
		synchTimer = Timeout.set(function() {
			Register.indexedStorage.GetTranslations(
				Register.dictionaryManager.ConstructTranslationsRequest(null), 
			function(dicitonary) 
			{
				_this.setDictionary(dicitonary, function() {
					console.log("Dictionary in sync storage updated.");
					if(callback) {
						callback();
					}
				});
			});
		}, 2000);
	};
	
	this.setDictionary = function(dictionary, callback) 
	{
		var syncHash = generateRundomString(10);
		this.local.set(setData(_keys.synchash, syncHash), function() {
			_this.sync.set(setData(_keys.synchash, syncHash), function() {
				_this.sync.set(setData(_keys.dicitonary, JSON.stringify(dictionary)), function() 
				{
					callback();
				});
			});
		});
	};
	
	this.getDictionary = function(callback) 
	{
		return this.sync.get(_keys.dicitonary, function(result) {
			callback(JSON.parse(result[_keys.dicitonary]));
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