var DB = function ()
{
	var _db = null;
	
	function getDb()
	{
		if(!_db) 
		{
			_db = window.openDatabase('YMDB', '1.0', 'Translation Reminder', 2 * 1024 * 1024);

			_db.transaction(function (tx)
			{
				tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, translation, date, hits)', null, null,
				function (tx, error)
				{
					console.log(error);
				});

				tx.executeSql('CREATE TABLE IF NOT EXISTS Settings (setting, value)', null, null,
				function (tx, error)
				{
					console.log(error);
				});
			});
		}

		return _db;
	};
	
	function performTransaction (query, data, onsuccess, onerror) 
	{
		getDb().transaction(function (tx)
		{
			tx.executeSql(query, data,
			function (tx, results)
			{
				onsuccess(results, tx);
			},
			function (tx, error)
			{
				console.log(error);
				if(onerror) {
					onerror();
				}
			});
		});
	};


	this.GetWords = function (order, direction, callback)
	{
		return Register.IndexedDB.GetWords(order, direction, callback);
		
		performTransaction("SELECT * FROM words ORDER BY " + order + " " + direction, null, 
		function(results, tx) 
		{
			var words = [];
			for (var i = 0; i < results.rows.length; i++)
			{
				if(results.rows.item(i).word) 
				{
					words.push({
						word: results.rows.item(i).word,
						translation: results.rows.item(i).translation,
						date: results.rows.item(i).date,
						hits: results.rows.item(i).hits
					});
				}
			}

			if (callback) {
				callback(words);
			}
		});
	};


	this.AddWord = function (word, translation, date, callback)
	{
		return Register.IndexedDB.AddWord(word, translation, date, callback);
		
		this.isWordExists(word, function(exists) 
		{
			if(!exists) 
			{
				performTransaction('INSERT INTO words (word, translation, date, hits) VALUES (?, ?, ?, ?)', [word, translation, date, 1],
				function (results)
				{
					if (callback) {
						callback();
					}
				});
			} else {
				callback();
			}
		});
	};
	
	this.isWordExists = function(word, callback) 
	{
		performTransaction('SELECT * FROM words WHERE word=?', [word],
		function (results)
		{
			if (callback) {
				callback(results.rows.length > 0);
			}
		});
	};

	this.UpdateWordHitCount = function (word, hits, callback)
	{
		return Register.IndexedDB.UpdateWordHitCount(word, hits, callback);
		performTransaction('UPDATE words SET hits=? WHERE (word)=?', [hits, word],
		function (results)
		{
			if (callback) {
				callback();
			}
		});
	};


	this.DeleteWord = function (word, callback)
	{
		return Register.IndexedDB.DeleteWord(word, callback);
		performTransaction('DELETE FROM words WHERE (word)=?', [word],
		function (results)
		{
			if (callback) {
				callback();
			}
		});
	};

	this.DeleteAllWords = function (callback)
	{
		return Register.IndexedDB.DeleteAllWords(callback);
		performTransaction('DELETE FROM words', [],
		function (results)
		{
			if (callback){
				callback();
			}
		});
	};

	this.GetAllSettings = function (callback)
	{
		return Register.synchStorage.getSettings(function(settings) {
			callback(settings);
		});
		performTransaction("SELECT * FROM Settings", [],
		function (results)
		{
			var settings = {};
			for (var i = 0; i < results.rows.length; i++)
			{
				settings[results.rows.item(i).setting] = results.rows.item(i).value;
			}

			if (callback)
			{
				callback(settings);
			}
		});
	};
	
	this.SetSetting = function (setting, value, callback)
	{
		return Register.synchStorage.updateSetting(setting, value, function() {
			if (callback) {
				callback();
			}
		});
		this.GetAllSettings(function (settings)
		{
			var query = 'INSERT INTO Settings (setting, value) VALUES (?, ?)';
			var params = [setting, value];

			if (settings[setting])
			{
				query = 'UPDATE Settings SET value=? WHERE (setting)=?';
				params = [value, setting];
			}

			performTransaction(query, params,
			function (results)
			{
				if (callback) {
					callback();
				}
			});
		});
	};
};

var DBObjects = 
{
	Translations: "Translations",
};

var DBStorage = function()
{
	var _this = this;
	this.db = null;
	
	this.init = function ()
	{
		//indexedDB.deleteDatabase("TranslationReminder");
		var openRequest = indexedDB.open("TranslationReminder", 1);

		openRequest.onupgradeneeded = function (e) 
		{
			console.log("running onupgradeneeded");
			_this.db = e.target.result;

			if (!_this.db.objectStoreNames.contains(DBObjects.Translations)) 
			{
				var objectStore = _this.db.createObjectStore(DBObjects.Translations, {autoIncrement: true});

				objectStore.createIndex("word", "word", { unique: true });
				objectStore.createIndex("date", "date", { unique: false });
			}
			
			if (!_this.db.objectStoreNames.contains(DBObjects.Settings)) {
				var objectStore = _this.db.createObjectStore(DBObjects.Settings);
			}

		};

		openRequest.onsuccess = function (e) {
			console.log("Db opened.");
			_this.db = e.target.result;
		};

		openRequest.onerror = function (e) {
			console.log("Opeening db error");
			console.dir(e);
		};
	};
	
	this.runTransaction = function(dbObject, type, requestFunc, oncomplete, onsuccess, onerror) 
	{
		var transaction = this.db.transaction(dbObject, type);
		var store = transaction.objectStore(dbObject);
		
		var request = requestFunc(transaction, store);
		
		transaction.oncomplete = function(e) 
		{
			console.log("Transaction complete.");
			oncomplete(e, transaction);
		};
		
		request.onsuccess = function(e) 
		{
			console.log("Transaction succeeded.");
			if(onsuccess) {
				onsuccess(e, transaction, store);
			}
		};
		
		request.onerror = function(e) {			
			console.log("Translaction failed: ", e.target.error.name);
			
			if(onerror)
				onerror(e);
		};
	};
	
	this.GetWords = function (order, direction, callback)
	{
		var words = [];
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			return store.openCursor();
		},
		function(e) 
		{
			if (callback) {
				callback(words);
			}
		},
		function(e) 
		{
			var cursor = e.target.result;
			if(cursor) {
				words.push(cursor.value);
				cursor.continue();
			}
		});
	};


	this.AddWord = function (word, translation, date, callback)
	{
		this.isWordExists(word, function(isExists) 
		{
			if(!isExists) 
			{
				_this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
				{
					var translationItem = {
						word: word,
						translation: translation,
						date: date,
						hits: 1
					};

					return store.add(translationItem);
				},
				function() 
				{
					Register.synchStorage.synchWords(function() {
						callback();
					});
				});
			}
			else 
			{
				callback();
			}
		});
	};
	
	this.getTranslationByText = function(word, callback, onSuccess) 
	{
		var translation = null;
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			var index = store.index('word');
			var keyRange = IDBKeyRange.only(word);

			return index.openCursor(keyRange);
		},
		function() 
		{
			callback(translation);
		},
		function(e, tr, store) 
		{
			var cursor = e.target.result;

			if (cursor) {
				translation = cursor.value;
			}
			
			if(onSuccess) 
				onSuccess(translation, tr, store, cursor);
		});
	};
	
	this.isWordExists = function(word, callback) 
	{
		this.getTranslationByText(word, function(translation) 
		{
			callback(translation != null);
		});
	};

	this.UpdateWordHitCount = function (word, hits, callback)
	{
		this.getTranslationByText(word, function(translation, tr, store) 
		{
			callback();
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				translation.hits = hits;
				cursor.update(translation);
			}
		});
	};


	this.DeleteWord = function (word, callback)
	{
		this.getTranslationByText(word, function(translation, tr, store) 
		{
			Register.synchStorage.synchWords(function() {
				callback();
			});
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				cursor.delete(translation);
			}
		});
	};

	this.DeleteAllWords = function (callback)
	{
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			return store.clear();
		}, 
		function() {
			Register.synchStorage.synchWords(function() {
				callback();
			});
		});
	};

	this.GetAllSettings = function (callback)
	{
		
	};

	this.SetSetting = function (setting, value, callback)
	{
		
	};
	
	this.setWords = function(words, callback) 
	{
		var i = 0;
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			
		}, function() {
			
		}, function(e, tr, store) {
			putNextWord();

			function putNextWord() 
			{
				if (i<words.length) {
					store.put(words[i]).onsuccess = putNextWord;
					++i;
				} else {   // complete
					console.log('populate complete');
					callback();
				}
			}
		});
	};
};

var DBTransactionTypes = 
{
	rw: "readwrite"
};

Register.DB = new DB();

Register.IndexedDB = new DBStorage();
Register.IndexedDB.init();

var SynchStorage = function() 
{
	var _keys = {
		settings: "settings",
		words: "words",
		synchash: "synchash"
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
		Register.IndexedDB.GetWords(null, null, function(words) {
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
			if(!res[_keys.settings]) {
				_this.setSettings({
					SitesBlackList: "",
					AutoTranslatioinEnabled: Props.defaults.AutoTranslationEnabled,
					TranslationLanguage: Props.defaults.TranslationLanguage
				}, function() {
					return _this.getSettings(callback);
				});
			} else {
				callback(res[_keys.settings]);
			}
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
};

Register.synchStorage = new SynchStorage();
Register.synchStorage.init();