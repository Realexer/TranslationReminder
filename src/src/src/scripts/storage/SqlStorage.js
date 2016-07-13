var SqlStorage = function ()
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


	this.AddWord = function (word, translation, date, hits, callback)
	{
		this.isWordExists(word, function(exists) 
		{
			if(!exists) 
			{
				performTransaction('INSERT INTO words (word, translation, date, hits) VALUES (?, ?, ?, ?)', [word, translation, date, hits],
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
		return Register.indexedStorage.DeleteAllWords(callback);
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

Register.sqlStorage = new SqlStorage();