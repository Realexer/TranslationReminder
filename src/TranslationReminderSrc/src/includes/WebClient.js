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
					} else
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

		opera.postError("Web Request Post Data:" + retStr);

		return retStr;
	}

	this.synchronize = function (data)
	{
		this.send(data);
	};

	this.createAccount = function (userId, caller)
	{
		opera.postError("Web create acc with:" + userId);
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/AddUser",
			callback: function (data)
			{
				opera.postError("Web Response Create Acc Data:" + data);

				if (data == "1")
				{
					saveUserID(userId);
					caller.postMessage({ message: "acc_created" });
				}
				else
				{
					caller.postMessage({ message: "acc_created_failed" });
				}
			},
			data:
					{
						data:
							{
								userName: userId
							}
					}
		});
	};

	this.login = function (userId, caller)
	{
		opera.postError("Web login with:" + userId);
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/CheckUser",
			callback: function (data)
			{
				opera.postError("Web Response Login Data:" + data);

				if (data == "1")
				{
					saveUserID(userId);
					caller.postMessage({ message: "logined" });
				}
				else
				{
					caller.postMessage({ message: "login_failed" });
				}
			},
			data:
					{
						data:
							{
								userName: userId
							}
					}
		});
	};


	this.send = function (data, caller)
	{
		opera.postError("Web Request Data:" + data.data);
		ajax({
			type: "POST",
			url: "http://lf.inegata.ru/YM/UpdateWords",
			callback: function (data)
			{
				opera.postError("Web Response Data:" + data);
				var updatedData = jsonParse(data);
				if (updatedData.ret_code)
				{
					var updatedWords = updatedData.data;
					opera.postError("Words:", updatedWords);

					deleteAllWordsFromStorage(null);

					for (var i = 0; i < updatedWords.length; i++)
					{
						var curWord = updatedWords[i];
						writeWord(curWord.word, curWord.meaning, null, curWord.date);
					}

					if (caller)
					{
						caller.postMessage({ message: "synchronized" });
					}

				}
			},
			data:
					{
						data:
							{
								userName: getUserID(),
								words: data.words
							}
					}
		});
	};
};
