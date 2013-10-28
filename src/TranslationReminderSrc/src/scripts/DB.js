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

			tx.executeSql('CREATE TABLE IF NOT EXISTS SitesBlackList (site)', null, null,
			function (tx, error)
			{
				// TODO: Report error
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
				// TODO: Report error
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
				// TODO: Report error
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
				// TODO: Report error
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
				// TODO: Report error
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
				opera.postError("Delete error: " + error);
			});
		});
	};


	this.AddSiteToBlackList = function (site, callback)
	{
		if (this.GetSitesBlackList(function (sites)
		{
			if (sites.indexOf(site) == -1)
			{
				getDb().transaction(function(tx)
				{
					tx.executeSql('INSERT INTO SitesBlackList (site) ' + 'VALUES (?)', [site.toLowerCase()],

						function(tx, results)
						{
							if (callback)
							{
								callback();
							}
						},
						function(tx, error)
						{
							// TODO: Report error
						});
				});
			}
		}));
	};


	this.GetSitesBlackList = function (callback)
	{
		getDb().transaction(function (tx)
		{
			tx.executeSql("SELECT * FROM SitesBlackList", [],
			function (tx, results)
			{
				var sites = new Array();
				for (var i = 0; i < results.rows.length; i++)
				{
					sites.push(results.rows.item(i).site);
				}

				if (callback)
				{
					callback(sites);
				}
			},
			function (tx, error)
			{
				// TODO: Report error
			});
		});
	};

	this.DeleteSiteFromBlackList = function (site, callback)
	{
		getDb().transaction(function (tx)
		{
			word = word.trim();
			tx.executeSql('DELETE FROM SitesBlackList WHERE (site)=?', [site.toLowerCase()],
			function (tx, results)
			{
				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				// TODO: Report error
			});
		});
	};
};