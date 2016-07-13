var SynchStorage = function() 
{
	var _keys = {
		words: "words",
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
		//this.sync.remove([_keys.words, _keys.settings]);
		this.local = chrome.storage.local;
		
		chrome.storage.onChanged.addListener(function(changes, namespace) 
		{
			for (var key in changes) 
			{
				if(key == _keys.words) 
				{
					_this.local.get(_keys.synchash, function(localHash) {
						_this.sync.get(_keys.synchash, function(syncHash) {
							if(localHash[_keys.synchash] != syncHash[_keys.synchash]) 
							{
								console.log("Words sync required");
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
	
	this.synchWords = function(callback) 
	{
		Register.indexedStorage.GetWords(null, null, function(words) {
			_this.setWords(words, callback);
		});
	};
	
	this.setWords = function(words, callback) 
	{
		var syncHash = generateRundomString(10);
		this.local.set(setData(_keys.synchash, syncHash), function() {
			_this.sync.set(setData(_keys.synchash, syncHash), function() {
				_this.sync.set(setData(_keys.words, JSON.stringify(words)), function() 
				{
					callback();
				});
			});
		});
	};
	
	this.getWords = function(callback) 
	{
		return this.sync.get(_keys.words, function(result) {
			callback(JSON.parse(result[_keys.words]));
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