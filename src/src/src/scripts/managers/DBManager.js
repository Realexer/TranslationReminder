var DBManager = function() 
{
	var _this = this;
	
	this.init = function() 
	{
		importSQLdataToIndexedDB();
	};
	
	function importSQLdataToIndexedDB() 
	{
		Register.synchStorage.isSqlDataImported(function(isImported) 
		{
			if(!isImported) 
			{
				Register.sqlStorage.GetWords(WordsOrder.order.date, WordsOrder.direction.DESC, function(words) 
				{
					performOnElsList(words, function(word, i) 
					{
						Register.translationsManager.AddTranslation(word.word, word.translation, null, null, function() 
						{
							if(i == words.length-1) 
							{
								Register.synchStorage.setSqlDataImported(true);
							}
						});
					});
				});
			}
		});
	};
};

Register.dbManager = new DBManager();
Register.dbManager.init();

Register.DB = Register.indexedStorage;