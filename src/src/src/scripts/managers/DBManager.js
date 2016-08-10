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
				Register.sqlStorage.GetWords(TranslationsOrder.order.date, TranslationsOrder.direction.DESC, function(words) 
				{
					performOnElsList(words, function(word, i) 
					{
						Register.indexedStorage.AddTranslation(TranslationAdapter.getFromExisting({
							text: word.word, 
							translation: word.translation,
							date: word.date,
							hits: word.hits,
							learned: false
						}).getData(), function() 
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

Register.DB = Register.indexedStorage;