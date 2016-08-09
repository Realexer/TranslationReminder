var Register = 
{
	
};

var Timeout = new function() 
{
	this.reset = function(timeout) 
	{
		if(timeout != null) {
			clearTimeout(timeout);
			timeout = null;
		}
	};
	
	this.set = function(func, time) 
	{
		var timeout = setTimeout(function() {
			func();
			timeout = null;
		}, time);
		
		return timeout;
	};
};

function isParentHasClass(child, className) 
{
	return (getParentByClass(child, className) != undefined);
}

function getParentByClass(child, className) 
{
	var node = child;
	while (node != null) {
		if (node.className && node.className.indexOf(className) > -1) {
			return node;
		}
		node = node.parentNode;
	}
	return undefined;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var WindowManager = new function() 
{
	this.documentHasFocus = function() 
	{
		if(document.hasFocus) 
		{
			return document.hasFocus();
		}
		else if(typeof document.hidden !== "undefined")
		{
			return document.hidden;
		}
		
		return false;
	}
};

var Threader = 
{
	putInQueue: function(_func, callback) 
	{
		Timeout.set(function() 
		{
			var res = _func();

			if(callback) {
				callback(res);
			}}
		, 1);
	}
};

var Events = 
{
	htmlChanged: "htmlChanged",
	elementContentChanged: "elementContentChanged",
	elDisplayed: "elDisplayed",
	elHidden: "elHidden"
};

var EventsManager = 
{
	listeners: [],
	
	isEventSupported: function(event) 
	{
		return Events[event] !== undefined;
	},
	
	ifEventSupported: function(event, func) 
	{
		if(this.isEventSupported(event)) {
			func();
		} else {
			console.log("EventsManager: event with name '"+event+"' not supported.");
		}
	},
	
	subscribe: function(event, func, id)
	{
		this.ifEventSupported(event, function() 
		{
			if(!EventsManager.listeners[event]) {
				EventsManager.listeners[event] = [];
			}
			
			EventsManager.listeners[event].push({
				id: id,
				func: func
			});
		});
	},
	
	subscribeMulti: function(events, func, id) 
	{
		performOnElsList(events, function(event) {
			EventsManager.subscribe(event, func, id);
		});
	},
	
	subscribeOnce: function(event, func, id) 
	{
		EventsManager.subscribe(event, function() {
			func();
			EventsManager.unsubscribe(event, id);
		}, id);
	},
	
	unsubscribe: function(event, id) 
	{
		if(this.listeners[event] && id) {
			performOnElsList(this.listeners[event], function(item, i) {
				if(item.id == id) 
				{
					EventsManager.listeners[event].splice(i, 1);
				}
			});
		}
	},
	
	fire: function(event, data) 
	{
		this.ifEventSupported(event, function() 
		{
			if(EventsManager.listeners[event]) 
			{
				performOnElsList(EventsManager.listeners[event], function(handler) {
					Threader.putInQueue(function() {
						handler.func(data, event);
					});
				});
			}
		});
	}
};

var Initer = 
{
	constructors: [],
	initers: [],
	uiIniters: [],
	uiRunners: [],
	
	addConstructor: function(func) {
		this.constructors.push(func);
		return this;
	},
	addIniter: function(func) {
		this.initers.push(func);
		return this;
	},
	addUIIniter: function(func) 
	{
		this.uiIniters.push(func);
		return this;
	},
	addUIRuner: function(func) 
	{
		this.uiRunners.push(func);
		return this;
	},
	ready: function()
	{
		performOnElsList(this.constructors, function(constructor) {
			constructor();
		});
	},
	run: function() 
	{
		performOnElsList(this.initers, function(initer) {
			initer();
		});
	},
	initUI: function() 
	{
		performOnElsList(this.uiIniters, function(runner) {
			runner();
		});
	},
	runUI: function() 
	{
		performOnElsList(this.uiRunners, function(runner) {
			runner();
		});
	},
	whenTrue: function(func, callback, timeout) 
	{
		var interval = setInterval(function() {
			if(func() == true) 
			{
				try {
					callback();
				} catch (e) 
				{
					console.log(e);
				}
				clearInterval(interval);
			}
		}, timeout);
	}
};