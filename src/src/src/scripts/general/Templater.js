var Templater = function() 
{
	var _this = this;
	this.loadedTemplates = {};
	
	this.prepareUI = function() 
	{
		this.retrieveTemplates();
		this.drawTemplates();
	};

	this.retrieveTemplates = function() 
	{
		var templates = document.querySelectorAll("[data-js-template]");
		for(var i = 0; i < templates.length; i++) 
		{
			var templateItem = templates[i];
			var templateName = UIManager.getElAttr(templateItem, "data-js-template");
			
			if(this.loadedTemplates[templateName] === undefined) 
			{
				this.loadedTemplates[templateName] = templateItem;
			}
		}
	};
	
	this.drawTemplates = function() 
	{
		performOnElsList(document.querySelectorAll("[data-js-use-template]"), function(el) 
		{
			var templateName = UIManager.getElAttr(el, "data-js-use-template");
			var data = UIManager.getElAttr(el, "data-js-template-data");
			if(data) {
				data = JSON.parse(data);
			}
			
			UIManager.setHTML(el, _this.formatTemplate(templateName, data));
			UIManager.removeElAttr(el, "data-js-use-template");
		});
	};

	this.getTemplate = function(templateName) 
	{
		if(this.loadedTemplates[templateName] != undefined) 
		{
			return this.loadedTemplates[templateName];
		}
		else 
		{
			throw "Cannot find template "+templateName;
		}
	};

	this.getTemplateHtml = function(templateName) 
	{
		var template = this.getTemplate(templateName);
		return template.innerHTML;
	};

	this.formatTemplate = function(templateName, data) 
	{
		return this.formatTempalateText(this.getTemplateHtml(templateName), data);
	};
	
	this.formatTempalateText = function(string, data) 
	{
		string = string.replace(new RegExp("{{(.[^{{]+)}}", "g"), function(match, matchInner) 
		{
			var expressionParts = applyForEveryElOnList(matchInner.split("|"), function(val, key) {
				return val.trim();
			});
			
			if(expressionParts.length > 1) 
			{
				var func = parseDataExpression(expressionParts[0], window, undefined);
				var arguments = parseExpressionArguments(expressionParts[1], data);

				if(func !== undefined) 
				{
					value = func.apply(this, arguments);
				}
			}
			else 
			{
				var value = parseDataExpression(expressionParts[0], data, match);
			}
			
			return value;
		});

		return string;
	};
	
	function parseDataExpression(expression, data, _default) 
	{
		var tempData;
		
		if(expression && data) 
		{
			tempData = data;
			var keys = expression.split(".");
		
			for(var i = 0; i < keys.length; i++) 
			{
				if(tempData[keys[i]] !== undefined) 
				{
					tempData = tempData[keys[i]];
				}
				else 
				{
					console.log("Templater: Cannot find data for " + expression);
					tempData = _default;
				}
			}
		}
		
		if(tempData === undefined) {
			tempData = _default;
		}
		
		if(tempData === null) {
			tempData = "";
		}
		
		return tempData;
	}
	
	function parseExpressionArguments(expression, data) 
	{
		var retArgs = [];
		
		if(expression) 
		{
			var args = expression.split(",");
			
			performOnElsList(args, function(item) 
			{
				item = item.trim().replace(/&quot;/g, '\"');
				if(item.match(/^[\"']|[\"']$/g) !== null) 
				{
					retArgs.push(item.replace(/^[\"']|[\"']$/g, ''));
				}
				else 
				{
					if(item == "this") {
						retArgs.push(data);
					} else {
						retArgs.push(parseDataExpression(item, data, item));
					}
				}
			});
		}
		
		return retArgs;
	}
	
	this.formatElHtml = function(el, data) 
	{
		UIManager.setHTML(el, _this.formatTempalateText(UIManager.getHTML(el), data));
	};
	
	this.prepareValue = function(val) 
	{
		if(val === null) {
			val = "";
		}
		
		return val;
	};
};

Initer.addConstructor(function() {
	Register.templater = new Templater();
}).addIniter(function() {
	Templater.UI.init();
});


Templater.UI = 
{
	init: function() 
	{
		EventsManager.subscribe(Events.htmlChanged, function(el) 
		{
			performOnElsList(el.querySelectorAll("[data-checked]"), function(el) 
			{
				el.checked = getBool(el.getAttribute("data-checked"));
			});
		});
	},
	userAccountInfo: function(accountName, data) 
	{
		if(accountName) 
		{
			return Register.templater.formatTemplate("UserPageAccountName", data);
		}
		else 
		{
			return Register.templater.formatTemplate("UserPageNoAccount", data);
		}
	},
	userOnlineMessage: function(isActive, data) 
	{
		if(getBool(isActive)) 
		{
			return Register.templater.formatTemplate("UserPageUserOnline", data);
		}
		else 
		{
			return Register.templater.formatTemplate("UserPageUserOffline", data);
		}
	},
	print: 
	{
		_evalCondition: function(cond, _true, _false) {
			if(_false === undefined) {
				_false = "";
			}
			
			return cond ? _true : _false;
		},
		ifTrue: function(condition, text, _deff) 
		{
			return Templater.UI.print._evalCondition(getBool(condition), text, _deff);
		},
		ifFalse: function(condition, text, _deff) 
		{
			return Templater.UI.print._evalCondition(!getBool(condition), text, _deff);
		},
		ifEmpty: function(value, text, _deff) 
		{
			return Templater.UI.print._evalCondition(UIFormat.isEmptyString(value), text, _deff);
		},
		ifNotEmpty: function(value, text, _deff) 
		{
			return Templater.UI.print._evalCondition(!UIFormat.isEmptyString(value), text, _deff);
		},
		ifMoreThan0: function(value, text, _deff) 
		{
			return Templater.UI.print._evalCondition((value > 0), text, _deff);
		},
		ifLessThan0: function(value, text, _deff) 
		{
			return Templater.UI.print._evalCondition((value < 0), text, _deff);
		},
		orDefault: function(value, _default) 
		{
			return value ? value : _default;
		}
	}
};