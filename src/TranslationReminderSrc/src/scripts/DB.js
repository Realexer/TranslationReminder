var DB = function ()
{
	function getDb()
	{
		var db = window.openDatabase('YMDB', '1.0', 'Translation Reminder', 2 * 1024 * 1024);

		db.transaction(function (tx)
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, translation, date, hits)', null, null,
			function (tx, error)
			{
				// TODO: Report error
			});

			tx.executeSql('CREATE TABLE IF NOT EXISTS Settings (setting, value)', null, null,
			function (tx, error)
			{
				console.log(error);
			});
		});

		return db;
	};


	this.GetWords = function (callback, order, direction)
	{
		if (!order)
			order = "date";

		if (!direction)
			direction = "DESC";

		getDb().transaction(function (tx)
		{
			tx.executeSql("SELECT * FROM words ORDER BY " + order + " " + direction, [],
			function (tx, results)
			{
				var words = new Array();
				for (var i = 0; i < results.rows.length; i++)
				{
					words.push({
						word: results.rows.item(i).word,
						translation: results.rows.item(i).translation,
						date: results.rows.item(i).date,
						hits: results.rows.item(i).hits
					});
				}

				if (callback)
				{
					callback(words);
				}
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};


	this.AddWord = function (word, translation, date, callback)
	{
		getDb().transaction(function (tx)
		{
			if (date == null)
			{
				date = new Date().getTime();
			}

			date = parseInt(date);

			word = word.trim();
			tx.executeSql('INSERT INTO words (word, translation, date, hits) ' +
							'VALUES (?, ?, ?, ?)', [word.toLowerCase(), translation, date, 1],

			function (tx, results)
			{
				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};

	this.UpdateWordHitCount = function (word, hits, callback)
	{
		getDb().transaction(function (tx)
		{
			word = word.trim();
			tx.executeSql('UPDATE words SET hits=? WHERE (word)=?', [hits, word.toString().toLowerCase()],
			function (tx, results)
			{
				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};


	this.DeleteWord = function (word, callback)
	{
		getDb().transaction(function (tx)
		{
			word = word.trim();
			tx.executeSql('DELETE FROM words WHERE (word)=?', [word.toString().toLowerCase()],
			function (tx, results)
			{
				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};

	this.DeleteAllWords = function (callback)
	{
		getDb().transaction(function (tx)
		{
			tx.executeSql('DELETE FROM words', [],
			function (tx, results)
			{
				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};

	var settingsKeys =
	{
		SitesBlackList: "SitesBlackList"
	};

	var getAllSettings = function (callback)
	{
		getDb().transaction(function (tx)
		{
			tx.executeSql("SELECT * FROM Settings", [],
			function (tx, results)
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
			},
			function (tx, error)
			{
				console.log(error);
			});
		});
	};

	var setSetting = function (setting, value, callback)
	{
		getAllSettings(function (settings)
		{
			var query = 'INSERT INTO Settings (setting, value) VALUES (?, ?)';
			var params = [setting, value];

			if (settings[setting])
			{
				query = 'UPDATE Settings SET value=? WHERE (setting)=?';
				params = [value, setting];
			}

			getDb().transaction(function (tx)
			{
				tx.executeSql(query, params,
					function (tx, results)
					{
						if (callback)
						{
							callback();
						}
					},
					function (tx, error)
					{
						console.log(error);
					});
			});
		});
	};

	this.GetSitesBlackList = function (callback)
	{
		getAllSettings(function (settings)
		{
			var result = [];

			if (settings[settingsKeys.SitesBlackList])
				result = settings[settingsKeys.SitesBlackList].split(";");

			callback(result);
		});
	};

	this.UpdateSitesBlackList = function (sites, callback)
	{
		setSetting(settingsKeys.SitesBlackList, sites.RemoveDuplicates().TrimAllElements().join(";"), callback);
	};

	this.AddSiteToBlackList = function (site, callback)
	{
		var db = this;
		this.GetSitesBlackList(function (sites)
		{
			sites.push(site);
			db.UpdateSitesBlackList(sites, callback);
		});
	};

};