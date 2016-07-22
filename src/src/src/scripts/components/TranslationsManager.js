var TranslationsManager = function ()
{
	var _this = this;
	
	this.init = function() 
	{
		
	};
	
	this.GetTranslations = function (callback, request)
	{
		var request = OR(request, {});
		request.order = OR(request.order, {});
		request.condition = OR(request.condition, {});

		Messanger.sendMessage(Messages.BE.DB.GetTranslations, 
		{
			order: {
				field: OR(request.order.field, TranslationsOrder.order.date),
				direction: OR(request.order.direction, TranslationsOrder.direction.DESC)
			},
			condition: {
				learned: request.condition.learned,
				lang: request.condition.lang
			}
		}, callback);
	};


	this.AddTranslation = function (text, translation, image, definition, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.AddTranslation, 
		{
			text: prepareTextForDB(text),
			translation: translation,
			image: image,
			definition: definition,
			date: dateToTimestamp(),
			hits: 1,
			learned: false,
			learnedAt: null
		}, callback);
	};
	
	this.EditTranslation = function (text, translation, image, definition, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.EditTranslation, 
		{
			text: prepareTextForDB(text),
			translation: translation,
			image: image,
			definition: definition,
		}, callback);
	};

	this.SetTranslationHitsCount = function (text, hits, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.SetTranslationHitsCount, 
		{
			text: prepareTextForDB(text),
			hits: hits
		}, callback);
	};
	
	this.setTextLearned = function(text, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.SetTextLearned, 
		{
			text: prepareTextForDB(text),
			learned: true,
			learnedAt: dateToTimestamp()
		}, callback);
	};
	
	this.setTextLearning = function(text, callback) 
	{
		Messanger.sendMessage(Messages.BE.DB.SetTextLearned, 
		{
			text: prepareTextForDB(text),
			learned: false,
			learnedAt: null
		}, callback);
	};


	this.DeleteTranslation = function (text, callback)
	{
		Messanger.sendMessage(Messages.BE.DB.DeleteTranslation, 
		{
			text: prepareTextForDB(text)
		}, callback);
	};

	this.DeleteAllTranslations = function (callback)
	{
		Messanger.sendMessage(Messages.BE.DB.DeleteAllTranslations, callback);
	};
	
	function prepareTextForDB(text) 
	{
		return text.toString().toLowerCase().trim();
	};
	
	function dateToTimestamp(date) 
	{
		if (!date) {
			date = new Date().getTime();
		}

		return parseInt(date);
	};
};

Register.translationsManager = new TranslationsManager();
Register.translationsManager.init();