var Config = new function()
{
	this._isMobile = false;
	this.iconMain = null;
	this.iconAlt = null;
	
	this.getBaseUrl = function() 
	{
		return "https://chatprostotak.com/";
	};

	this.isMobile = function()
	{
		return this._isMobile;// || window.matchMedia("screen and (max-width: 530px)").matches;
	};
	
	this.isDesctop = function() 
	{
		return !this._isMobile;
	};
	
	this.setMobile = function(isMobile) 
	{
		this._isMobile = isMobile;
	};
};

var Register = 
{
	
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

var ErrorHandler = function(id) 
{
	var _this = this;
	
	this.id = null;
	this.lastError = null;
	
	var _errorHandler = document.getElementById(id);
	var _errorMessage = _errorHandler.querySelector(".ErrorMessage");
	var _hideErrorButton = _errorHandler.querySelector(".HideErrorButton");
	var _reportButton = _errorHandler.querySelector(".ReportButton");
	
	this.init = function() 
	{
		UIManager.addEventNoDefault(_hideErrorButton,"click", function(e) {
			_this.hide();
		});
	};
	
	this.handle = function(ex, userFriendlyMessage)
	{
		this.lastError = null;
		
		if(ex) {
			console.log(ex);
			this.lastError = new Array(ex, ex.message, ex.stack, ex.userData, navigator.userAgent).join("\n");;
			UIManager.showEl(_reportButton, "inline");
		}
		else 
		{
			UIManager.hideEl(_reportButton);
		}
		
		if(userFriendlyMessage) 
		{
			UIManager.showEl(_errorHandler);
			UIManager.setHTML(_errorMessage, userFriendlyMessage);
		}
	};
	
	this.report = function() 
	{
		if(_this.lastError) 
		{
			_this.sendError(_this.lastError, function() {
				_this.hide();
			});
		}
	};
	
	this.sendError = function(error, callback) 
	{
		WebClient.submitError(error, callback);
	};
	
	this.hide = function() 
	{
		UIManager.hideEl(_errorHandler);
	};
};


var docCookies = {
	getItem: function (sKey) {
		if (!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};

var SessionState = new function() 
{	
	this.saveValue = function(key, value) 
	{
		Storage.save(key, value);
//		docCookies.removeItem(key);
//		docCookies.setItem(key, value, Infinity, "/");
	};
	
	this.getValue = function(key, defaultValue) 
	{
		var value = Storage.get(key);
		
//		if (this.hasKey(key)) {
//			value = Storage.get(key);
//			//value = docCookies.getItem(key);
//		}
		
		if(value === null && defaultValue !== undefined) 
		{
			value = defaultValue;
		}
		
		return value;
	};
	
	this.hasKey = function(key) 
	{
		return this.getValue(key) !== null;
		//return docCookies.hasItem(key);
	};
	
	this.getAllKeys = function(pattern) 
	{
		var keys = docCookies.keys();
		
		if(pattern) {
			keys = keys.filter(function(key) {
				return key.match(pattern) != null;
			});
		}
		
		return keys;
	};
	
	this.deleteKey = function(key) 
	{
		return Storage.remove(key);
		//return docCookies.removeItem(key);
	};
	
	this.saveDisplayState = function(element)
	{
		var value = (element.style.display == "block") ? 1 : 0;

		this.saveValue(element.id, value);

		return value;
	};

	this.getDisplayState = function(element, defaultValue) 
	{	
		var value = (defaultValue !== undefined) ? defaultValue : 0;

		if (this.hasKey(element.id)) {
			value = parseInt(this.getValue(element.id));
		}

		return value;
	};

	this.restoreDisplayState = function(element, defaultValue)
	{
		var value = this.getDisplayState(element, defaultValue);

		element.style.display = parseInt(value) == 1 ? "block" : "none";
		return value;
	};
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

var ChatStatus = new function()
{
	this.statusNoAccess = 'NO_ACCESS';
	this.statusNotStarted = 'NOT_STARTED';
	this.statusOK = 'STARTED';
	this.statusClosed = 'CLOSED';
	
	this.isChatNotClosed = function(status) 
	{
		return (status != 'CLOSED' && status != 'NO_ACCESS');
	};
	
	this.isChatNotStarted = function(status)
	{
		return (status == 'NOT_STARTED');
	};
	
	this.isChatNotStartedConnected = function(status) 
	{
		return (status == 'NOT_STARTED_CONNECTED');
	};
	
	this.isChatStarted = function(status)
	{
		return (status == 'STARTED');
	};
	
	this.isChatActive = function(status) 
	{
		return (status == 'NOT_STARTED_CONNECTED') || (status == 'STARTED');
	};
	
	this.isChatAccessible = function(status)
	{
		return (status != 'NO_ACCESS');
	};
	
	this.isChatClosed = function(status) 
	{
		return (status == 'CLOSED' || status == 'CLOSED_AFTER_STARTED');
	};
	
	
	this.isChatClosedAfterStarted = function(status) 
	{
		return (status == 'CLOSED_AFTER_STARTED');
	};
	
	this.isChatRejected = function(status) 
	{
		return (status == 'REJECTED');
	};
};

var Popover = new function() 
{
	var _this = this;
	
	var _popoverTriggerClass = "__popoverTrigger";
	var _popoverBodyClass = "__popoverBody";
	
	this.init = function() 
	{
		if(Config.isDesctop()) 
		{
			UIManager.addEvent(document, "click touchend", function(e) {
				_this.hideAllPopevers(e.target);
			});

			performOnElsList(getAllElsByClass(_popoverTriggerClass), function(el) {
				UIManager.addEvent(el, "click", function() {
					_this.hideAllPopevers(getEl(UIManager.getElData(el, 'popover-body')));
				});
			});
		}
	};
	
	this.hideAllPopevers = function(target) 
	{
		var popoversList = document.getElementsByClassName(_popoverBodyClass);
		
		for(var i = 0; i < popoversList.length; i++)
		{
			var popover = popoversList[i];
			
			var targetPopover = getParentByClass(target, _popoverBodyClass);
			var targetTrigger = getParentByClass(target, _popoverTriggerClass);
			var triggerPopover = (targetTrigger) ? getEl(UIManager.getElData(targetTrigger, "popover-body")) : null;
			
			if(target && (targetPopover == popover || triggerPopover == popover) ) 
			{
				continue;
			}
			
			UIManager.hideEl(popover);
		}
	};
};

Initer.addConstructor(function() {
	Popover.init();
});


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

var TabManager = new function() 
{
	this.setUrl = function(title, url, content) 
	{
		window.history.pushState(content, title, url);
	};
	
	this.setTitle = function(title) 
	{
		document.title = title;
		NotificationCenter.documentOriginalTitle = title;
	};
};

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

var DateTimeManager = 
{
	convertTimeTagsToLocalTime: function(el)
	{
		var timeHandlersList = el.querySelectorAll(".TimeHandler");

		for (var i = 0; i < timeHandlersList.length; i++) 
		{
			var timeHandler = timeHandlersList[i];

			var utcTime = timeHandler.getAttribute('datetime');
			var prefix = timeHandler.getAttribute('prefix');

			if(utcTime && prefix !== null) {
				var formattedDate = DateTimeManager.getFormattedDate(utcTime, prefix);
				timeHandler.innerHTML = formattedDate;
			}
		}
	},
	// format example 2014-12-19 13:43:55
	getFormattedDate: function (timeString, prefix)
	{
		var value = timeString;

		var prefixPart = "";
		if (prefix) {
			prefixPart = prefix + " ";
		}

		if(timeString) 
		{
			var date = new Date(timeString.replace(/-/g, "/") + " UTC");
		//	var date = new Date(Date.UTC(utcDate.getFullYear(),utcDate.getMonth(),utcDate.getDate(),
		//								utcDate.getHours(), utcDate.getMinutes(), utcDate.getSeconds()));

			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();

			var hour = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();

			var datePart = year + "-" + OX(month) + "-" + OX(day);
			var timePart = OX(hour) + ":" + OX(minutes) + ":" + OX(seconds);

			var currentDate = new Date();
			var yesterday = new Date(new Date().setHours(date.getHours() - 24));


			value = datePart + " " + timePart;

			if (currentDate.getTime() - date.getTime() < 1000 * 60 * 60 * 24 * 2)
			{
				var timePassed = currentDate.getTime() - date.getTime() > 1000 * 60 * 60 * 3;

				if (date.getDate() == yesterday.getDate())
				{
					value = timePart;
					if (prefix) {
						prefixPart = prefix + " "+UIText.format(UIText.timeLabel_yesterdayAt)+" ";
					} else {
						prefixPart = " "+UIText.format(UIText.timeLabel_yesterday)+" ";
					}
				}

				if (date.getDate() == currentDate.getDate()) {
					value = timePart;
					if (prefix) {
						prefixPart = prefix + " "+UIText.format(UIText.timeLabel_today)+" ";
					}
				}

				if (timePassed == false) {
					if (prefix)
					{
						prefixPart = prefix + " "+UIText.format(UIText.timeLabel_todayAt)+" ";
					}
				}
			}
		}

		return prefixPart + "<time>" + value + "</time>";

	},
	dateDaysDiff: function (d1, d2)
	{
		var t2 = d2.getTime();
		var t1 = d1.getTime();

		return parseInt((t2 - t1) / (24 * 3600 * 1000));
	},
	dateUtcFromString: function(timeString) 
	{
		return new Date(timeString.replace(/-/g, "/") + " UTC");
	}
}

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
	elDisplayed: "elDisplayed",
	elHidden: "elHidden",
	
	userAuthInfoChanged: "userAuthInfoChanged",
	
	userInfoUpdateRequested: "userInfoUpdateRequested",
	userInfoChanged: "userInfoChanged",
	userTagsChanged: "userTagsChanged",
	userFilterChanged: "userFilterChanged",
	afterUserFilterChanged: "afterUserFilterChanged",
	
	userFinishedEditingTags: "userFinishedEditingTags",
	userFinishedEditingFilters: "userFinishedEditingFilters",
	
	userLangsChanged: "userLangsChanged",
	usersFilterDataUpdated: "usersFilterDataUpdated",
	usersListChanged: "usersListChanged",
	onlineTagsChanged: "onlineTagsChanged",
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