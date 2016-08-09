var DictionaryManager = function ()
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
	
	this.GetTranslationByText = function(text, _funcOK, _funcNotFound) 
	{
		Messanger.sendMessage(Messages.BE.DB.GetTranslationByText, {text: text}, function(translation) {
			if(translation) {
				_funcOK(translation);
			} else {
				if(_funcNotFound)
					_funcNotFound();
			}
		});
	};


	this.AddTranslation = function (text, translation, image, definition, callback)
	{
		this.GetTranslationByText(text, function(data) 
		{
			_this.setTextLearning(text, callback);
		}, function() {
			Messanger.sendMessage(Messages.BE.DB.AddTranslation, 
				TranslationAdapter.getNew(text, translation, image, definition), callback);
		});
	};
	
	this.EditTranslation = function (text, translation, image, definition, callback)
	{
		this.GetTranslationByText(text, function(data) 
		{
			var tr = TranslationAdapter.getFromExisting(data);
			tr.edit(text, translation, image, definition);
			
			Messanger.sendMessage(Messages.BE.DB.UpdateTranslation, tr.getData(), callback);
			
		}, callback);
	};

	this.SetTranslationHitsCount = function (text, hits, callback)
	{
		this.GetTranslationByText(text, function(data) 
		{
			var tr = TranslationAdapter.getFromExisting(data);
			tr.hits = hits;
			
			Messanger.sendMessage(Messages.BE.DB.UpdateTranslation, tr.getData(), callback);
			
		}, callback);
	};
	
	this.setTextLearned = function(text, callback) 
	{
		this.GetTranslationByText(text, function(data) 
		{
			var tr = TranslationAdapter.getFromExisting(data);
			tr.setLearned();
			
			Messanger.sendMessage(Messages.BE.DB.UpdateTranslation, tr.getData(), callback);
			
		}, callback);
	};
	
	this.setTextLearning = function(text, callback) 
	{
		this.GetTranslationByText(text, function(data) 
		{
			var tr = TranslationAdapter.getFromExisting(data);
			tr.setLearning();
			
			Messanger.sendMessage(Messages.BE.DB.UpdateTranslation, tr.getData(), callback);
			
		}, callback);
	};


	this.DeleteTranslation = function (text, callback)
	{
		this.GetTranslationByText(text, function(data) 
		{
			var tr = TranslationAdapter.getFromExisting(data);
			
			Messanger.sendMessage(Messages.BE.DB.DeleteTranslation, tr.getData(), callback);
			
		}, callback);
		
	};

	this.DeleteAllTranslations = function (callback)
	{
		Messanger.sendMessage(Messages.BE.DB.DeleteAllTranslations, callback);
	};
};


var Translation = function()
{
	var _this = this;
	
	this.text = null;
	this.translation = null;
	this.image = null;
	this.definition = null;
	this.lang = null;
	this.date = null;
	this.hits = null;
	this.learned = null;
	this.learnedAt = null;
	
	this.edit = function(text, translation, image, definition) 
	{
		this.text = TranslationAdapter.prepareTextForDB(text);
		this.translation = translation;
		this.image = image;
		this.definition = definition;
	};
	
	this.setLearned = function() 
	{
		this.learned = true;
		this.learnedAt = TranslationAdapter.dateToTimestamp();
	};
	
	this.setLearning = function() 
	{
		this.learned = false;
		this.learnedAt = null;
	};
	
	this.getData = function() 
	{
		return JSON.parse(JSON.stringify(this));
	};
};

var TranslationAdapter = 
{
	getNew: function(text, translation, image, definition, lang) 
	{
		var tr = new Translation();
		
		tr.text = TranslationAdapter.prepareTextForDB(text);
		tr.translation = translation;
		tr.image = image;
		tr.definition = definition;
		tr.lang = lang;
		tr.date = TranslationAdapter.dateToTimestamp();
		tr.hits = 1;
		tr.learned = false;
		tr.learnedAt = null;
		
		return tr;
	},
	
	getFromExisting: function(data) 
	{
		var tr = new Translation();
		
		performOnEveryKey(data, function(key, val) {
			tr[key] = val;
		});
		
		return tr;
	},
	
	prepareTextForDB: function(text) 
	{
		return text.toString().toLowerCase().trim();
	},
	
	dateToTimestamp: function(date) 
	{
		if (!date) {
			date = new Date().getTime();
		}

		return parseInt(date);
	}
}

Register.dictionaryManager = new DictionaryManager();
Register.dictionaryManager.init();