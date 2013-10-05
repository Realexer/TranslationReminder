var DB = function ()
{
	function getDb()
	{
		var db = window.openDatabase('YMDB', '1.0', 'Translation Reminder', 2 * 1024 * 1024);
		
		db.transaction(function (tx)
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, meaning, toDelete, toEdit, userName, date)', null, null,
			function (tx, error)
			{
				// TODO: Report error
			});
		});

		return db;
	};

	this.SaveUserID = function (userId)
	{
		localStorage.setItem("userId", userId);
	};

	this.GetUserID = function ()
	{
		try
		{
			return localStorage.getItem("userId");
		}
		catch (ex)
		{
			// TODO: Report error
		}

	};


	this.GetWords = function (callback)
	{
		var userName = this.GetUserID();
		if (!userName)
			return false;

		getDb().transaction(function (tx)
		{
			tx.executeSql("SELECT * FROM words WHERE userName =? ORDER BY date DESC", [userName],
			function (tx, results)
			{
				var callbackArray = new Array();
				for (var i = 0; i < results.rows.length; i++)
				{
					callbackArray.push({
						word: results.rows.item(i).word,
						meaning: results.rows.item(i).meaning,
						toDelete: results.rows.item(i).toDelete,
						toEdit: results.rows.item(i).toEdit,
						date: results.rows.item(i).date
					});
				}

				if (callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				// TODO: Report error
			});

			return true;
		});
	};


	this.WriteWord = function (word, meaning, date, callback)
	{
		var userName = this.GetUserID();
		if (!userName)
		{
			return false;
		}

		getDb().transaction(function (tx)
		{
			if (date === undefined || date === null)
			{
				date = new Date().getTime();
			}

			date = parseInt(date);

			word = word.fullTrim();
			tx.executeSql('INSERT INTO words (word, meaning, toDelete, toEdit, userName, date) ' +
							'VALUES (?, ?, 0, 0, ?, ?)', [word.toLowerCase(), meaning, userName, date],

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

		return true;
	};


	this.DeleteWord = function (word, callback)
	{
		var userName = this.GetUserID();
		if (!userName)
			return false;


		getDb().transaction(function (tx)
		{
			word = word.fullTrim();
			tx.executeSql('UPDATE words SET toDelete=1 WHERE (word)=? AND (userName)=?', [word.toString().toLowerCase(), userName],
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

		return true;
	};

	this.DeleteAllWords = function (callback)
	{
		var userName = this.GetUserID();
		if (!userName)
			return false;

		getDb().transaction(function (tx)
		{
			tx.executeSql('DELETE FROM words WHERE (userName) = ?', [userName],
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

		return true;
	};
};