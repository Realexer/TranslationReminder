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
		this.isTextExists(request, function(isExists) 
		{
			if(!isExists) 
			{
				_this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
				{
					return store.add(request);
				},
				function() 
				{
					callback();
					Register.synchStorage.synchTranslations();
				});
			}
			else 
			{
				callback();
			}
		});
	};
	
	this.UpdateTranslation = function(request, callback) 
	{
		this.getTranslationByText(request, function(translation, tr, store) 
		{
			callback();
			Register.synchStorage.synchTranslations();
		},
		function(translation, tr, store, cursor) 
		{
			if(translation && cursor) {
				performOnEveryKey(request, function(key, value) {
					translation[key] = value;
				});
				cursor.update(translation);
			}
		});
	};
	
	this.getTranslationByText = function(request, callback, onSuccess) 
	{
		var translation = null;
		this.runTransaction(DBObjects.Translations, DBTransactionTypes.rw, function(tr, store) 
		{
			var index = store.index('text');
			var keyRange = IDBKeyRange.only(request.text);

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
	
	this.isTextExists = function(request, callback) 
	{
		this.getTranslationByText(request, function(translation) 
		{
			callback(translation != null);
		});
	};

	this.DeleteTranslation = function (request, callback)
	{
		this.getTranslationByText(request, function(translation, tr, store) 
		{
			callback();
			Register.synchStorage.synchTranslations();
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
			callback();
			Register.synchStorage.synchTranslations();
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