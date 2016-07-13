var WordsManager = function ()
{
	var _this = this;
	
	this.init = function() 
	{
		
	};
	
	this.GetWords = function (callback, order, direction)
	{
		if (!order)
			order = WordsOrder.order.date;

		if (!direction)
			direction = WordsOrder.direction.DESC;
		
		Messanger.sendMessage(Messages.BE.DB.GetWords, 
		{
			order: order,
			direction: direction
		}, callback);
	};


	this.AddWord = function (word, translation, date, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.AddWord, 
		{
			word: prepareWordForDB(word),
			translation: translation,
			date: dateToTimestamp(date),
			hits: 1
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