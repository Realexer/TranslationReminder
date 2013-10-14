var DB = function ()
{
	function getDb()
	{
		var db = window.openDatabase('YMDB', '1.0', 'Translation Reminder', 2 * 1024 * 1024);
		
		db.transaction(function (tx)
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, meaning, date)', null, null,
			function (tx, error)
			{
				// TODO: Report error
			});
		});

		return db;
	};


	this.GetWords = function (callback)
	{
		getDb().transaction(function (tx)
		{
			tx.executeSql("SELECT * FROM words ORDER BY date DESC", [],
			function (tx, results)
			{
				var words = new Array();
				for (var i = 0; i < results.rows.length; i++)
				{
					words.push({
						word: results.rows.item(i).word,
						meaning: results.rows.item(i).meaning,
						date: results.rows.item(i).date
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


	this.WriteWord = function (word, meaning, date, callback)
	{
		getDb().transaction(function (tx)
		{
			if (date == null)
			{
				date = new Date().getTime();
			}

			date = parseInt(date);

			word = word.trim();
			tx.executeSql('INSERT INTO words (word, meaning, date) ' +
							'VALUES (?, ?, ?)', [word.toLowerCase(), meaning, date],

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
};