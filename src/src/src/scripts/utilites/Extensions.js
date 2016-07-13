String.prototype.trim = function (symbol)
{
	if (!symbol)
		symbol = "\\s";

	return this.replace(new RegExp("^" + symbol + "+|" + symbol + "+$", "g"), '');
};


if (window.Element != undefined && !window.Element.getElementsByClassName)
{
	window.Element.prototype.getElementsByClassName = function (className)
	{
		return this.querySelectorAll('.' + className);
	};

	function hasInParents(childNode, parentNodeClass)
	{
		if (childNode.classList && childNode.classList.contains(parentNodeClass))
		{
			return true;
		}
		else
		{
			if (childNode.parentNode)
			{
				return hasInParents(childNode.parentNode, parentNodeClass);
			}
		}
		
		return false;
	}

	window.Element.prototype.hasInParents = function (nodeClassName)
	{
		return hasInParents(this, nodeClassName);
	};

	function hasInChildren(parentNode, nodeClassName)
	{
		for (var i = 0; i < parentNode.childNodes.length; i++)
		{
			var child = parentNode.childNodes[i];
			if (child.classList && child.classList.contains(nodeClassName))
			{
				return true;
			}

			if (child.childNodes.length > 0) 
			{
				return hasInChildren(child, nodeClassName);
			}
		}
	}

	window.Element.prototype.hasInChildren = function (nodeClassName)
	{
		return hasInChildren(this, nodeClassName);
	};
}

if (!document.getElementsByClassName)
{
	document.getElementsByClassName = function (className)
	{
		return document.querySelectorAll('.' + className);
	};
}

Date.prototype.Ago = function ()
{
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = new Date() - this;

	if (elapsed < msPerMinute)
	{
		return Math.round(elapsed / 1000) + ' seconds ago';
	}

	else if (elapsed < msPerHour)
	{
		return Math.round(elapsed / msPerMinute) + ' minutes ago';
	}

	else if (elapsed < msPerDay)
	{
		return Math.round(elapsed / msPerHour) + ' hours ago';
	}

	else if (elapsed < msPerMonth)
	{
		return '~ ' + Math.round(elapsed / msPerDay) + ' days ago';
	}

	else if (elapsed < msPerYear)
	{
		return '~ ' + Math.round(elapsed / msPerMonth) + ' months ago';
	}

	else
	{
		return '~ ' + Math.round(elapsed / msPerYear) + ' years ago';
	}
};

Templater.UI.print.dateAgo = function(time) 
{
	return new Date(time).Ago();
};

Array.prototype.RemoveDuplicates = function ()
{
	return this.filter(function (v, i, a) { return a.indexOf(v) == i; });
};

Array.prototype.TrimAllElements = function ()
{
	this.forEach(function (el, i, a) { a[i] = el.trim(); });
	return this;
};

function OR(value, _default) 
{
	return value ? value : _default;
}