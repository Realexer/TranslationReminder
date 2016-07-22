var DBObjects = 
{
	Translations: "Translations"
};

var DBTransactionTypes = 
{
	rw: "readwrite"
};

var DBOrderDirection = 
{
	ASC: "next",
	DESC: "prev",
	
	next: "next",
	prev: "prev",
	nextunique: "nextunique",
	prevunique: "prevunique",
};

var IndexedStorage = function()
{
	var _this = this;
	this.db = null;
	
	this.init = function ()
	{
		//indexedDB.deleteDatabase("TranslationReminder");
		var openRequest = indexedDB.open("TranslationReminder", 1);

		openRequest.onupgradeneeded = function (e) 
		{
			console.log("running onupgradeneeded");
			_this.db = e.target.result;
			var tr = e.target.transaction;

			if (!_this.db.objectStoreNames.contains(DBObjects.Translations)) 
			{
				var objectStore = _this.db.createObjectStore(DBObjects.Translations, {autoIncrement: true});
			}
			
			var objectStore = tr.objectStore(DBObjects.Translations);
			_this.updateIndex(objectStore, "text", "text", { unique: true });
			_this.updateIndex(objectStore, "date", "date", { unique: false });
			_this.updateIndex(objectStore, "hits", "hits", { unique: false });
		};

		openRequest.onsuccess = function (e) {
			_this.db = e.target.result;
		};

		openRequest.onerror = function (e) {
			console.log("Opeening db error");
			console.dir(e);
		};
	};
	
	this.updateIndex = function(store, index, keypath, value) 
	{
		try{
			store.deleteIndex(index);
		} catch(e) {}
		
		store.createIndex(index, keypath, value);
	};
	
	this.runTransaction = function(dbObject, type, requestFunc, oncomplete, onsuccess, onerror) 
	{
		var transaction = this.db.transaction(dbObject, type);
		var store = transaction.objectStore(dbObject);
		
		var request = requestFunc(transaction, store);
		
		transaction.oncomplete = function(e) 
		{
			oncomplete(e, transaction);
		};
		
		request.onsuccess = function(e) 
		{
			if(onsuccess) {
				onsuccess(e, transaction, store);
			}
		};
		
		request.onerror = function(e) {			
			console.log("Translaction failed: ", e.target.error.name);
			
			if(onerror)
				onerror(e);
		};
	};
	
	this.GetTranslations = function (request, callback)
	{
		var translations = [];
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			return store.index(request.order.field).openCursor(null, DBOrderDirection[request.order.direction]); 
		},
		function(e) 
		{
			if (callback) {
				callback(translations);
			}
		},
		function(e) 
		{
			var cursor = e.target.result;
			if(cursor) {
				var translation = cursor.value;
				
				if((request.condition.learned === undefined || translation.learned == request.condition.learned) 
				&& (request.condition.lang === undefined || translation.lang == request.condition.lang)) 
				{
					translations.push(cursor.value);
				}
				cursor.continue();
			}
		});
	};


	this.AddTranslation = function (request, callback)
	{
		this.isTextExists(request.text, function(isExists) 
		{
			if(!isExists) 
			{
				_this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
				{
					return store.add(request);
				},
				function() 
				{
					Register.synchStorage.synchTranslations(function() {
						callback();
					});
				});
			}
			else 
			{
				callback();
			}
		});
	};
	
	this.EditTranslation = function(request, callback) 
	{
		this.getTranslationByText(request.text, function(translation, tr, store) 
		{
			Register.synchStorage.synchTranslations(function() {
				callback();
			});
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				translation.translation = request.translation;
				translation.image = request.image;
				translation.definition = request.definition;
				cursor.update(translation);
			}
		});
	};
	
	this.getTranslationByText = function(text, callback, onSuccess) 
	{
		var translation = null;
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			var index = store.index('text');
			var keyRange = IDBKeyRange.only(text);

			return index.openCursor(keyRange);
		},
		function() 
		{
			callback(translation);
		},
		function(e, tr, store) 
		{
			var cursor = e.target.result;

			if (cursor) {
				translation = cursor.value;
			}
			
			if(onSuccess) 
				onSuccess(translation, tr, store, cursor);
		});
	};
	
	this.isTextExists = function(text, callback) 
	{
		this.getTranslationByText(text, function(translation) 
		{
			callback(translation != null);
		});
	};

	this.SetTranslationHitsCount = function (request, callback)
	{
		this.getTranslationByText(request.text, function(translation, tr, store) 
		{
			callback();
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				translation.hits = request.hits;
				cursor.update(translation);
			}
		});
	};

	this.SetTextLearned = function(request, callback) 
	{
		this.getTranslationByText(request.text, function(translation, tr, store) 
		{
			callback();
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				translation.learned = request.learned;
				translation.learnedAt = request.learnedAt;
				cursor.update(translation);
			}
		});
	};

	this.DeleteTranslation = function (request, callback)
	{
		this.getTranslationByText(request.text, function(translation, tr, store) 
		{
			Register.synchStorage.synchTranslations(function() {
				callback();
			});
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				cursor.delete(translation);
			}
		});
	};

	this.DeleteAllTranslations = function (callback)
	{
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			return store.clear();
		}, 
		function() {
			Register.synchStorage.synchTranslations(function() {
				callback();
			});
		});
	};
	
	this.setTranslations = function(translations, callback) 
	{
		var i = 0;
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			
		}, function() {
			
		}, function(e, tr, store) {
			putNextTranslation();

			function putNextTranslation() 
			{
				if (i < translations.length) {
					store.put(translations[i]).onsuccess = putNextTranslation;
					++i;
				} else {
					callback();
				}
			}
		});
	};
};

Register.indexedStorage = new IndexedStorage();
Register.indexedStorage.init();

Register.DB = Register.indexedStorage;