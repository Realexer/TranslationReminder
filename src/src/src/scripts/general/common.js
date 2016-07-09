function getEl(elId) 
{
	return document.getElementById(elId);
}

function getElByClass(className) 
{
	return document.getElementsByClassName(className)[0];
}

function getAllElsByClass(className) 
{
	return document.getElementsByClassName(className);
}

function applyForEveryElOnList(elsList, _function) 
{
	for(var i = 0; i < elsList.length; i++) 
	{
		elsList[i] = _function(elsList[i], i);
	}
	
	return elsList;
}

function performOnElsList(elsList, _function) 
{
	for(var i = 0; i < elsList.length; i++) 
	{
		var result = _function(elsList[i], i);
		if(false === result) {
			break;
		}
	}
}

function performOnEveryKey(obj, _function) 
{
	for (var key in obj) 
	{
		if (obj.hasOwnProperty(key)) 
		{
			_function(key, obj[key]);
		}
	}
}

function perfromRecursivelyOnList(list, startIndex, stepFunc, allDoneFunc) 
{
	stepFunc(list[startIndex], startIndex, function() {
		startIndex++;
		if(startIndex < list.length) {
			perfromRecursivelyOnList(list, startIndex, stepFunc, allDoneFunc);
		}
		else 
		{
			allDoneFunc();
		}
	});
}

//perfromRecursivelyOnList(["a", "b", "c"], 0, function(item, index, callback) 
//{
//	setTimeout(function() {
//		console.log("Processing item: " + item);
//		callback();
//	}, 1000);
//},
//function() 
//{
//	console.log("All items are processed.");
//});

function removeFromArray(el, array) 
{
	var index = array.indexOf(el);
	if (index > -1) 
	{
		array.splice(index, 1);
	}
}

function getBool(val)
{
	if(val === undefined) 
		return false;
	
	switch (val.toString().toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;

		case "false":
		case "no":
		case "0":
		case null:
			return false;

		default:
			return Boolean(val);
	}
}

function getString(val) 
{
	if(val) 
	{
		return val;
	}
	else 
	{
		return "";
	}
}

function escapeHtml(text)
{
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}

function moveCaretToEnd(el)
{
	if (typeof el.selectionStart == "number") {
		el.selectionStart = el.selectionEnd = el.value.length;
	} else if (typeof el.createTextRange != "undefined") {
		el.focus();
		var range = el.createTextRange();
		range.collapse(false);
		range.select();
	}
}

function OX(num) {
	return (num < 10) ? "0" + num : num;
}

function merge_options(obj1, obj2) {
	var obj3 = {};
	for (var attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}
	for (var attrname in obj2) {
		obj3[attrname] = obj2[attrname];
	}
	return obj3;
}



function setViewPortWidth(width)
{
	var metaTagsList = document.getElementsByTagName("meta");

	var viewPortSettings = metaTagsList["viewport"].getAttribute("content").split(",");

	for (var i = 0; i < viewPortSettings.length; i++)
	{
		var setting = viewPortSettings[i]
		if (setting.indexOf("width=") !== -1) {
			viewPortSettings[i] = "width=" + width;
		}
	}

	metaTagsList["viewport"].setAttribute("content", viewPortSettings.join(", "));
}

function adjustIndexPageForBodyWidth() 
{
	var width = UIManager.getElComputedStyle(getElByClass("Content"), "width", true);

	UIManager.applyClassToCollectionOnCondition(document.getElementsByClassName("IndexColumn"), "IndexColumn_SS", width <= 860);
	UIManager.applyClassToCollectionOnCondition(document.getElementsByClassName("IndexColumnSep"), "IndexColumn_SS", width <= 860);
}

/***
   Copyright 2013 Teun Duynstee
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
var firstBy = (function() {
    function makeCompareFunction(f, direction){
      if(typeof(f)!="function"){
        var prop = f;
        // make unary function
        f = function(v1){return v1[prop];}
      }
      if(f.length === 1) {
        // f is a unary function mapping a single item to its sort score
        var uf = f;
        f = function(v1,v2) {return uf(v1) < uf(v2) ? -1 : uf(v1) > uf(v2) ? 1 : 0;}
      }
      if(direction === -1)return function(v1,v2){return -f(v1,v2)};
      return f;
    }
    /* mixin for the `thenBy` property */
    function extend(f, d) {
      f=makeCompareFunction(f, d);
      f.thenBy = tb;
      return f;
    }

    /* adds a secondary compare function to the target function (`this` context)
       which is applied in case the first one returns 0 (equal)
       returns a new compare function, which has a `thenBy` method as well */
    function tb(y, d) {
        var x = this;
        y = makeCompareFunction(y, d);
        return extend(function(a, b) {
            return x(a,b) || y(a,b);
        });
    }
    return extend;
})();

Array.prototype.firstNextToLast = function(amount) 
{
	var tmpUsers = [];
	var tmpLength = this.length;
	
	for(var i = 0; i < tmpLength; i++) 
	{
		if(i % 2 == 0 || ((amount !== undefined) && tmpUsers.length >= amount)) 
		{
			tmpUsers.push(this.shift());
		}
		else 
		{
			tmpUsers.push(this.pop());
		}
	}

	return tmpUsers;
};

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};

function cloneObj(obj) 
{
	return JSON.parse(JSON.stringify(obj));
}

function generateRundomString(len)
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i <= len; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}