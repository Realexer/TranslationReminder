var Ajax = function ()
{
	function objectToHttpParam(dataObject, _key)
	{
		var retStr = "";

		for (var key in dataObject)
		{
			var value = dataObject[key];

			if (_key)
			{
				key = _key + "[" + key + "]";
			}

			if (Object.prototype.toString.call(value) === '[object Array]')
			{
				for (var i = 0; i < value.length; i++)
				{
					var tmpValue = value[i];
					if (typeof tmpValue === 'string')
					{
						retStr += encodeURIComponent(key) + "[]=" + encodeURIComponent(tmpValue) + "&";
					}
					else
					{
						retStr += objectToHttpParam(tmpValue, key + "[" + i + "]");
					}

				}
			}
			else if (Object.prototype.toString.call(value) === '[object Object]')
			{
				retStr += objectToHttpParam(value, key);
			}
			else
			{
				retStr += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
			}
		}

		return retStr;
	}

	this.Invoke = function(params, callback)
	{
		var xmlhttp;
		var dataToSend = "";

		// create crossbrowser xmlHttpRequest
		if (window.XMLHttpRequest)
		{
			// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		}
		else
		{
			// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{
				callback(xmlhttp.responseText, xmlhttp.status);
			}
		};

		dataToSend = objectToHttpParam(params.data);

		if (params.type && params.type.toString().toUpperCase() == 'POST')
		{
			xmlhttp.open(params.type, params.url, false);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.setRequestHeader("Content-length", dataToSend.length);
			xmlhttp.setRequestHeader("Connection", "close");

			xmlhttp.send(dataToSend);
		}
		else
		{
			xmlhttp.open(params.type, params.url + ((dataToSend != "") ? "?" + dataToSend : ""), false);
			xmlhttp.send(null);
		}
	};
};
