var WebClient = function ()
{
	function ajax(params)
	{
		var xmlhttp;
		var sendData = "";

		// create crossbrowser xmlHttpRequest
		if (window.XMLHttpRequest)
		{// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		}
		else
		{// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange = function ()
		{
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{
				params.callback(xmlhttp.responseText, xmlhttp.status);
			}
		};

		sendData = objectToHttpParam(params.data);

		if (params.type.toString().toUpperCase() == 'POST')
		{
			xmlhttp.open(params.type, params.url, false);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.setRequestHeader("Content-length", sendData.length);
			xmlhttp.setRequestHeader("Connection", "close");

			xmlhttp.send(sendData);
		}
		else
		{
			xmlhttp.open(params.type, params.url + "?" + sendData, false);
			xmlhttp.send(null);
		}
	}


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


	this.createAccount = function (userId, callback)
	{
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/AddUser",
			callback: function (data)
			{
				if (data == "1")
				{
					callback(true);
				}
				else
				{
					callback(false);
				}
			},
			data: {
				data: {
					userName: userId
				}
			}
		});
	};

	this.login = function (userId, callback)
	{
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/CheckUser",
			callback: function (data)
			{
				if (data == "1")
				{
					callback(true);
				}
				else
				{
					callback(false);
				}
			},
			data: {
				data: {
					userName: userId
				}
			}
		});
	};


	this.GetAllWords = function (userId, data, callback)
	{
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/UpdateWords",
			callback: function (data)
			{
				data = jsonParse(data);
				if (data.ret_code)
				{
					var userWords = data.data;

					if (callback)
					{
						callback(userWords);
					}
				}
			},
			data: {
				data: {
					userName: userId,
					words: data.words
				}
			}
		});
	};
};
