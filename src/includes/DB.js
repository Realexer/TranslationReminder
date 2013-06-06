var DB = function()
{
   function getDb()
   {
      opera.postError("Windows is: " + window);
      var db = window.openDatabase('YMDB', '1.0', 'Translation Reminder', 2 * 1024 * 1024);
      db.transaction(function(tx) {
	 tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, meaning, toDelete, toEdit, userName, date)', null, null,
		 function(tx, error)
		 {
		    opera.postError("Error: " + error);
		 });
      });

      return db;
   };

   
   this.SaveUserID = function(userId)
   {
      localStorage.setItem("userId", userId);
   };

   this.GetUserID = function()
   {
      var userId;
      try 
      {
	 userId = localStorage.getItem("userId");
      }
      catch (ex) 
      {
	 opera.postError("User ID Access error: " + ex.toString());
      }

      return userId;
   };


   this.GetWords = function(backMessage, event, callback)
   {
      // TODO: call synchronize explicitly
      var userName = getUserID();
      if (!userName)
	 return;

      var db = getDb();
      opera.postError("DB: " + db);
      db.transaction(function(tx) {

	 opera.postError("TX: " + tx);
	 var toDelete = "toDelete = 0";
	 if (callback) {
	    toDelete = "1";
	 }
	 tx.executeSql('SELECT * FROM words WHERE userName =? AND ' + toDelete + " ORDER BY date DESC", [userName],
		 function(tx, results)
		 {
		    opera.postError("Result length: " + results.rows.length);
		    var callbackArray = new Array();
		    for (var i = 0; i < results.rows.length; i++)
		    {
		       callbackArray.push
			       ({
				  word: results.rows.item(i).word,
				  meaning: results.rows.item(i).meaning,
				  toDelete: results.rows.item(i).toDelete,
				  toEdit: results.rows.item(i).toEdit,
				  date: results.rows.item(i).date
			       });
		    }
		    if (callback) {
		       event.source.postMessage({message: "begin_synchronize", words: callbackArray});
		    } else {
		       event.source.postMessage({message: backMessage, data: callbackArray});
		    }
		 },
		 function(tx, error) {
		    opera.postError("Get error: " + error);
		 });
      });
   };


   this.WriteWord = function(word, meaning, event, date)
   {
      var userName = getUserID();
      if (!userName) {
	 event.source.postMessage({message: "no_user"});
	 toolBarButton.click();
	 return;
      }

      word = fullTrim(word);
      opera.postError("Write data: " + word + meaning + event);
      var db = getDb();
      db.transaction(function(tx)
      {

	 if (date === undefined || date === null) 
	 {
	    date = new Date().getTime();
	 }
	 
	 date = parseInt(date);
	 tx.executeSql('INSERT INTO words (word, meaning, toDelete, toEdit, userName, date) ' +
		 'VALUES (?, ?, 0, 0, ?, ?)', [word.toLowerCase(), meaning, userName, date],
		 function(tx, results)
		 {
		    if (event) {
		       event.source.postMessage({message: "writed"});
		    }
		 },
		 function(tx, error) {
		    opera.postError("Write error: " + error);
		 });
      });
   };


   this.DeleteWord = function(word, event)
   {
      var userName = getUserID();
      if (!userName)
	 return;

      word = fullTrim(word);
      var db = getDb();
      db.transaction(function(tx) {
	 tx.executeSql('UPDATE words SET toDelete=1 WHERE (word)=? AND (userName)=?', [word.toString().toLowerCase(), userName],
		 function(tx, results)
		 {
		    if (event) {
		       event.source.postMessage({message: "deleted", data: word});
		    }
		 },
		 function(tx, error) {
		    opera.postError("Delete error: " + error);
		 });
      });
   };

   this.DeleteAllWords = function(event)
   {
      var userName = getUserID();
      if (!userName)
	 return;

      var db = getDb();
      db.transaction(function(tx) {
	 tx.executeSql('DELETE FROM words WHERE (userName) = ?', [userName],
		 function(tx, results)
		 {
		    if (event) {
		       event.source.postMessage({message: "deleted", data: word});
		    }
		 },
		 function(tx, error) {
		    opera.postError("Delete error: " + error);
		 });
      });
   };
};