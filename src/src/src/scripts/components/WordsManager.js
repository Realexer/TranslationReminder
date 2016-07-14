var WordsManager = function ()
{
	var _this = this;
	
	this.init = function() 
	{
		
	};
	
	this.GetWords = function (callback, request)
	{
		var request = OR(request, {});
		request.order = OR(request.order, {});
		request.condition = OR(request.condition, {});

		Messanger.sendMessage(Messages.BE.DB.GetWords, 
		{
			order: {
				field: OR(request.order.field, WordsOrder.order.date),
				direction: OR(request.order.direction, WordsOrder.direction.DESC)
			},
			condition: {
				learned: request.condition.learned,
				lang: request.condition.lang
			}
		}, callback);
	};


	this.AddWord = function (word, translation, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.AddWord, 
		{
			word: prepareWordForDB(word),
			translation: translation,
			date: dateToTimestamp(),
			hits: 1,
			learned: false,
			learnedAt: null
		}, callback);
	};

	this.UpdateWordHitCount = function (word, hits, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.UpdateWordHitCount, 
		{
			word: prepareWordForDB(word),
			hits: hits
		}, callback);
	};
	
	this.setWordLearned = function(word, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.SetWordLearned, 
		{
			word: prepareWordForDB(word),
			learned: true,
			learnedAt: dateToTimestamp()
		}, callback);
	};
	
	this.setWordLearning = function(word, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.SetWordLearned, 
		{
			word: prepareWordForDB(word),
			learned: false,
			learnedAt: null
		}, callback);
	};


	this.DeleteWord = function (word, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.DeleteWord, 
		{
			word: prepareWordForDB(word)
		}, callback);
	};

	this.DeleteAllWords = function (callback)
	{
		Messanger.sendMessage(Messages.BE.DB.DeleteAllWords, callback);
	};
	
	function prepareWordForDB(word) 
	{
		return word.toString().toLowerCase().trim();
	};
	
	function dateToTimestamp(date) 
	{
		if (!date) {
			date = new Date().getTime();
		}

		return parseInt(date);
	};
};

Register.wordsManager = new WordsManager();
Register.wordsManager.init();