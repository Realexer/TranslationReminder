var Templater = function() 
{
	var _this = this;
	this.loadedTemplates = {};
	
	this.templatesDeclarationAttr = "data-js-template";
	this.templatesUsageAttr = "data-js-use-template";
	this.templatesUsageDataAttr = "data-js-template-data";
	
	function formatAttrSelector(attr) 
	{
		return "["+attr+"]";
	}
	
	this.prepareUI = function(el) 
	{
		this.retrieveTemplates(el);
		this.drawTemplates(el);
	};

	this.retrieveTemplates = function(element) 
	{
		var templates = element.querySelectorAll(formatAttrSelector(_this.templatesDeclarationAttr));
		for(var i = 0; i < templates.length; i++) 
		{
			var templateItem = templates[i];
			var templateName = UIManager.getElAttr(templateItem, _this.templatesDeclarationAttr);
			
			if(this.loadedTemplates[templateName] === undefined) 
			{
				_this.drawTemplates(templateItem);
				this.loadedTemplates[templateName] = templateItem.innerHTML;
			}
		}
	};
	
	this.drawTemplates = function(element) 
	{
		performOnElsList(element.querySelectorAll(formatAttrSelector(_this.templatesUsageAttr)), function(el) 
		{
			var templateName = UIManager.getElAttr(el, _this.templatesUsageAttr);
			var data = UIManager.getElAttr(el, _this.templatesUsageDataAttr);
			if(data) {
				data = JSON.parse(data);
			}
			
			UIManager.setHTML(el, _this.formatTemplate(templateName, data));
			UIManager.removeElAttr(el, formatAttrSelector(_this.templatesUsageAttr));
		});
	};

	this.getTemplateHtml = function(templateName) 
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

	this.formatTemplate = function(templateName, data) 
	{
		return this.formatTempalateText(this.getTemplateHtml(templateName), data);
	};
	
	this.formatTempalateText = function(string, data) 
	{
		if(data) 
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
		}

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

Templater.UI = 
{
	dataAttributes: {
		checked: "data-checked",
		selected: "data-selected",
		src: "data-src"
	},
	init: function() 
	{
		EventsManager.subscribe(Events.htmlChanged, function(el) 
		{
			performOnElsList(el.querySelectorAll("["+Templater.UI.dataAttributes.checked+"]"), function(el) 
			{
				el.checked = getBool(el.getAttribute(Templater.UI.dataAttributes.checked));
			});
			
			performOnElsList(el.querySelectorAll("["+Templater.UI.dataAttributes.selected+"]"), function(el) 
			{
				el.selected = getBool(el.getAttribute(Templater.UI.dataAttributes.selected));
			});
		});
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
	},
	setSrc: function(el) 
	{
		performOnElsList(el.querySelectorAll("["+Templater.UI.dataAttributes.src+"]"), function(el) 
		{
			UIManager.setElAttr(el, "src", UIManager.getElAttr(el, Templater.UI.dataAttributes.src));
		});
	}
};