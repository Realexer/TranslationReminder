var UIManager = new function() 
{
	this.getElAttr = function(el, attribute, _default) 
	{
		return el.getAttribute(attribute) ? el.getAttribute(attribute) : _default;
	};
	
	this.setElAttr = function(el, attribute, value) 
	{
		return el.setAttribute(attribute, value);
	};
	
	this.removeElAttr = function(el, attribute) 
	{
		return el.removeAttribute(attribute);
	};
	
	this.getElData = function(el, dataAttribute) 
	{
		return UIManager.getElAttr(el, "data-"+dataAttribute);
	};
	
	this.setElData = function(el, dataAttribute, value) 
	{
		return UIManager.setElAttr(el, "data-"+dataAttribute, value);
	};
	
	this.isElDisplay = function(el, display) 
	{
		return el.style.display == display;
	};
	
	this.hideEl = function(el) 
	{
		el.style.display = 'none';
		
		EventsManager.fire(Events.elHidden, el);
		
		return UIManager;
	};
	
	this.hideElsList = function(elClass) 
	{
		performOnElsList(getAllElsByClass(elClass), function(el) {
			UIManager.hideEl(el);
		});
		
		return UIManager;
	};

	this.showEl = function(el, display) 
	{
		el.style.display = display ? display : 'block';
		
		EventsManager.fire(Events.elDisplayed, el);
		
		return UIManager;
	};
	
	this.showElsList = function(elClass, display) 
	{
		performOnElsList(getAllElsByClass(elClass), function(el) {
			UIManager.showEl(el, display);
		});
	};
	
	this.toggleElDisplay = function(el, display, showCallback, hideCallback) 
	{
		if(display === undefined) {
			display = 'block';
		}
		
		if(!this.isElDisplay(el, display)) 
		{
			this.showEl(el, display);
			if(showCallback) showCallback();
		}
		else
		{
			this.hideEl(el);
			if(hideCallback) hideCallback();
		}
		
		return el.style.display;
	};
	
	this.toggleElsListDisplay = function(elClass, display) 
	{
		performOnElsList(getAllElsByClass(elClass), function(el) {
			UIManager.toggleElDisplay(el, display);
		});
		
		return UIManager;
	};
	
	this.enEl = function(el) 
	{
		el.disabled = false;
	};
	
	this.disEl = function(el) 
	{
		el.disabled = true;
	};
	
	this.setFocus = function(el) 
	{
		el.focus();
	};
	
	this.getClass = function(el) 
	{
		return el.className;
	};
	
	this.setClass = function(el, className) 
	{
		el.className = className;
	};
	
	this.getHTML = function(el) 
	{
		return el.innerHTML;
	};
	
	
	this.setHTML = function(el, html) 
	{
		el.innerHTML = html;
		
		EventsManager.fire(Events.htmlChanged, el);
	};
	
	this.addHTML = function(el, html, atTop) 
	{
		if(atTop === true) 
		{
			el.innerHTML = html + el.innerHTML;
		}
		else 
		{
			el.innerHTML += html;
		}
		
		EventsManager.fire(Events.htmlChanged, el);
	};
	
	this.addNodeFromHTML = function(el, html, atTop) 
	{
		var tmpNode = document.createElement('span');
		UIManager.setHTML(tmpNode, html.trim()); // trimming so that first child will not be text
		el.appendChild(tmpNode);
		
		var newNode = tmpNode.firstChild;
		if(atTop) 
		{
			el.insertBefore(newNode, el.firstChild);
		}
		else 
		{
			el.appendChild(newNode);
		}
		
		UIManager.removeEl(tmpNode);
		
		EventsManager.fire(Events.htmlChanged, el);
		
		return newNode;
	};
	
	this.setNodeFromHTML = function(el, html) 
	{
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
		
		UIManager.addNodeFromHTML(el, html);
		
		EventsManager.fire(Events.htmlChanged, el);
	};
	
	this.removeEl = function(el) 
	{
		el.parentNode.removeChild(el);
	}
	
	this.clearEl = function(el) 
	{
		el.innerHTML = "";
	};
	
	this.setText = function(el, text) 
	{
		el.textContent = text;
	};
	
	this.getValue = function(el) 
	{
		return el.value.trim();
	};
	
	this.setValue = function(el, value) 
	{
		el.value = value;
	};
	
	this.appendValue = function(el, value) 
	{
		el.value += value;
	};
	
	this.resetValue = function(el) 
	{
		el.value = "";
	};
	
	this.isChecked = function(el) 
	{
		return el.checked;
	};
	
	this.setChecked = function(el, value) 
	{
		if(value === undefined) {
			value = true;
		}
		
		el.checked = getBool(value);
	};
	
	this.setSelectedOption = function(el, key) 
	{
		el.options[UIManager.getSelectorIndexOfOption(el, key)].selected = true;
	};
	
	this.getSelectedOption = function(el) 
	{
		return UIManager.getSelectorOptionOfIndex(el, el.options.selectedIndex);
	};
	
	this.getSelectorIndexOfOption = function(selector, key) 
	{
		var index = -1
		performOnElsList(selector.options, function(option, i) {
			if(UIManager.getValue(option) == key) 
			{
				index = i;
			}
		});
		
		return index;
	};
	
	this.getSelectorOptionOfIndex = function(selector, index) 
	{
		return UIManager.getValue(selector.options[index]);
	};
	
	this.scrollIntoView = function(el, countfixedNavbar) 
	{
		el.scrollIntoView();
		
		if(countfixedNavbar && Config.isDesctop()) 
		{
			var scrolledY = window.scrollY;
			
			if(scrolledY) 
			{
				window.scroll(0, scrolledY - LayoutManager.getHeaderHeight(true));
			}
		}
	};
	
	this.getScrollTop = function(el) 
	{
		return el.scrollTop;
	};
	
	this.setScrollTop = function(el, val) 
	{
		el.scrollTop = val;
	};
	
	this.scrollTop = function(el) 
	{
		UIManager.setScrollTop(el, 0);
	};
	
	this.scrollDown = function(el) 
	{
		UIManager.setScrollTop(el, el.scrollHeight);
	};
	
	
	this.getScrollDif = function(el) 
	{
		return el.scrollHeight - el.scrollTop;
	};
	
	this.setScrollDif = function(el, scrollDif) 
	{
		el.scrollTop = el.scrollHeight - scrollDif;
	};
	
	this.addClassToEl = function(el, className)
	{
		if(el.className) 
		{
			this.removeClassFromEl(el, className);
			
			var elClassList = el.className.split(" ");
			elClassList.push(className);
			el.className = elClassList.join(" ");
		} else {
			el.className = className;
		}
	};

	this.removeClassFromEl = function(el, classNameToRemove)
	{
		if(el.className) 
		{
			var elClassList = el.className.split(" ");
			var newClassList = new Array();
			elClassList.forEach(function(className) {
				if(className != classNameToRemove) 
				{
					newClassList.push(className);
				}
			});
			
			el.className = newClassList.join(" ");
		}
	};
	
	this.hasClass = function(el, className) 
	{
		return (el.className && el.className.indexOf(className) > -1);
	};
	
	this.toggleElClass = function(el, className) 
	{
		if(this.hasClass(el, className)) 
		{
			this.removeClassFromEl(el, className);
		}
		else 
		{
			this.addClassToEl(el, className);
		}
	};
	
	this.getStyle = function(el, style, isInt) 
	{
		var res = el.style[style];
		if(isInt) 
		{
			res = parseInt(res);
		}
		
		return res;
	};
	
	this.setStyle = function(el, style, value, units) 
	{
		if(units) 
		{
			value += units;
		}
		
		el.style[style] = value;
	};

	this.applyClassToCollectionOnCondition = function(collection, className, condition)
	{
		for (var i = 0; i < collection.length; i++) {
			if (condition) {
				this.addClassToEl(collection[i], className);
			} else {
				this.removeClassFromEl(collection[i], className);
			}
		}
	};
	
	this.addEvent = function(els, events, handler) 
	{
		performOnElsList(events.split(" "), function(event) {
			if(false == (els instanceof Array)) {
				els = [els];
			}
			
			performOnElsList(els, function(el) {
				el.addEventListener(event, function(e) {
					handler(e, el);
				});
			});
		});
	};
	
	this.addEventNoDefault = function(els, events, handler) 
	{		
		UIManager.addEvent(els, events, function(e) {
			e.preventDefault();
			handler(e, els);
		});
	};
	
	this.removeChildren = function(el) 
	{
		while (el.firstChild) {
			 el.removeChild(el.firstChild);
		}
	};
	
	this.getElComputedStyle = function(el, style, isInt)
	{
		var res = window.getComputedStyle(el).getPropertyValue(style);
		if(isInt) 
		{
			return parseInt(res);
		}
		
		return res;
	};
	
	
	this.preventScrollPropagation = function(el)
	{
		var onScroll = function(ev) {
			
			var el = this,
				 scrollTop = this.scrollTop,
				 scrollHeight = this.scrollHeight,
				 height = UIManager.getElComputedStyle(el, "height", true),
				 delta = ev.wheelDelta,
				 up = delta > 0;

			var prevent = function() {
				 ev.stopPropagation();
				 ev.preventDefault();
				 ev.returnValue = false;
				 return false;
			}

			if (!up && -delta > scrollHeight - height - scrollTop) {
				 // Scrolling down, but this will take us past the bottom.
				 el.scrollTop = scrollHeight;
				 return prevent();
			} else if (up && delta > scrollTop) {
				 // Scrolling up, but this will take us past the top.
				 el.scrollTop = 0;
				 return prevent();
			}
		};
		
		el.addEventListener('mousewheel', onScroll);
		el.addEventListener('DOMMouseScroll', onScroll);
	};
	
	
	this.adaptElHeight = function(el) 
	{
		if(!isFinite(UIManager.getStyle(el, "height", true))) 
		{
			UIManager.setStyle(el, "height", 0, "px");
		}
		
		for(var i = UIManager.getStyle(el, "height", true); i >= 0 ; --i) 
		{
			UIManager.setStyle(el, "height", i, "px");
			
			if (el.scrollHeight > el.clientHeight) 
			{
				UIManager.setStyle(el, "height", el.scrollHeight + 4, "px");
				break;
			}
		}
	};
	
	this.autogrowTetarea = function(el) 
	{
		var prevLengthDataAttr = "prev-length";
		
		UIManager.setElData(el, prevLengthDataAttr, UIManager.getValue(el).length);
		
		UIManager.addEvent(el, "change keyup", function(e) 
		{
			if(UIManager.getValue(el).length != UIManager.getElAttr(el, prevLengthDataAttr)) 
			{
				UIManager.adaptElHeight(el);

				UIManager.setElData(el, prevLengthDataAttr, UIManager.getValue(el).length);
			}
		});
	};
	
	this.rotate = function(el, degrees)
	{
		var rotateVal = "rotate("+degrees+"deg)";
		
		switch(degrees % 360) {
			case 90:
				rotateVal += " translateY(-100%)";
				break;
				
			case 180:
				rotateVal += " translate(-100%, -100%)";
				break;
			
			case 270:
				rotateVal += " translateX(-100%)";
				break;
		}
		
		if(navigator.userAgent.match("Chrome")){
			el.style.WebkitTransform = rotateVal;
		} else if(navigator.userAgent.match("Firefox")){
			el.style.MozTransform = rotateVal;
		} else if(navigator.userAgent.match("MSIE")){
			el.style.msTransform = rotateVal;
		} else if(navigator.userAgent.match("Opera")){
			el.style.OTransform = rotateVal;
		} else {
			el.style.transform = rotateVal;
		}
	};
	
	this.drawRotated = function(ctx, canvas, image, degrees)
	{
		var width = UIManager.getElComputedStyle(canvas, "width", true);
		var height = width * (image.height / image.width);
		
		var cw = width, ch = height, cx = 0, cy = 0;

		//   Calculate new canvas size and x/y coorditates for image
		switch(degrees){
			  case 90:
					 cw = height;
					 ch = width;
					 cy = height * (-1);
					 break;
			  case 180:
					 cx = width * (-1);
					 cy = height * (-1);
					 break;
			  case 270:
					 cw = height;
					 ch = width;
					 cx = width * (-1);
					 break;
		}

		//  Rotate image
		canvas.width = cw;
		canvas.height = ch;
		
		var hRatio = canvas.width  / image.width    ;
		var vRatio =  canvas.height / image.height  ;
		var ratio  = (image.height > image.width) ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);
		var centerShift_x = ( canvas.width - image.width*ratio ) / 2;
		var centerShift_y = ( canvas.height - image.height*ratio ) / 2;  
		
		ctx.rotate(degrees * Math.PI / 180);
		ctx.drawImage(image, 0, 0, 
								image.width, 
								image.height, 
								centerShift_x + cx, 
								centerShift_y + cy, 
								image.width*ratio, 
								image.height*ratio);
		
		//ctx.restore();
	};
};

var UIFormat = new function() 
{
	this.isEmptyString = function(str) 
	{
		return str == null || str.trim().length == 0;
	};
	
	this.isEmptyTagsStr = function(str) 
	{
		return str.trim().replace("-", "").length == 0;
	};
	
	this.prepareTag = function(tag) 
	{
		return tag.toLowerCase().
				  replace(/[[\]{}()*+?.,\\^$|#]/g, "").
				  replace(/[\s_]/g, "-").
				  trim();
	};
};


var UIDisplayToggler = new function() 
{
	this.restore = function(elId, showCallback, hideCallback, beforeCallback, defaultValue) 
	{
		SessionState.restoreDisplayState(getEl(elId), defaultValue);
		if(UIManager.isElDisplay(getEl(elId), "block")) 
		{
			this.show(elId, showCallback, beforeCallback);
		}
		else 
		{
			this.hide(elId, hideCallback, beforeCallback);
		}
	};
	
	this.toggleEl = function(elId, showCallback, hideCallback, beforeCallback, display) 
	{
		if(!display) display = "block";
		
		if(UIManager.isElDisplay(getEl(elId), display)) 
		{
			this.hide(elId, hideCallback, beforeCallback, display);
		}
		else 
		{
			this.show(elId, showCallback, beforeCallback, display);
		}
		
		return SessionState.saveDisplayState(getEl(elId));
	};
	
	this.show = function(elId, callback, beforeCallback, display) 
	{
		call(beforeCallback);
		
		if(!display) display = "block";
		
		UIManager.showEl(getEl(elId), display);
		SessionState.saveDisplayState(getEl(elId));
		
		call(callback);
	};
	
	this.hide = function(elId, callback, beforeCallback) 
	{
		call(beforeCallback);
		
		UIManager.hideEl(getEl(elId));
		SessionState.saveDisplayState(getEl(elId));
		
		call(callback);
	};
	
	function call(callback) 
	{
		if(callback) {
			callback();
		}
	}
};

var UIEffects = new function() 
{
	this.fadeOut = function(el) 
	{
		UIManager.addClassToEl(el, "opacity03");
	};
};