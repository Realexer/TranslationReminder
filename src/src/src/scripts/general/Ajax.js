var Ajax = new function ()
{
	var __profile = false;
	
	function objectToHttpParam(dataObject, _key)
	{
		var retStr = "?";

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

		return retStr.trim("&");
	}
	
	this.expectedStatuses = [];
	
	function isSuccessStatus(xhr) 
	{
		return (xhr.status >= 200 && xhr.status < 300) || (Ajax.expectedStatuses.indexOf(xhr.status) != -1);
	}


	this.Invoke = function(params, callback, errorCallback)
	{
		var xmlhttp;
		var dataToSend = null;
		
		// create crossbrowser xmlHttpRequest
		if (window.XMLHttpRequest)
		{
			// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new window.XMLHttpRequest();
		}
		else
		{
			// code for IE6, IE5
			xmlhttp = new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4)
			{
				if(isSuccessStatus(xmlhttp)) {
					Ajax.onLoad(xmlhttp, params, callback, errorCallback);
				}
				else 
				{
					if(xmlhttp.status == 429) 
					{
						var retryAfter = xmlhttp.getResponseHeader('Retry-After');
						if(!retryAfter) retryAfter = 2000;
						
						setTimeout(function() 
						{
							Ajax.Invoke(params, callback, errorCallback);
						}, retryAfter);
					}
					
					performOnElsList(Ajax.onErrorHandlersList, function(handler) {
						handler(xmlhttp);
					});
				}
			}
		};
		
		xmlhttp.onabort = function() 
		{
			xmlhttp.aborted = true;
			if(__profile)
			{
				console.log("Request was aborted: " + xmlhttp.userData.url
						  + "\nData: " + JSON.stringify(xmlhttp.userData.data));
			}
		};
		
		xmlhttp.onloadend = function()
		{
			if(__profile)
			{
				console.log("Request was loaded: " + xmlhttp.userData.url
						  + "\nData: " + JSON.stringify(xmlhttp.userData.data));
			}
		};

		xmlhttp.userData = params;
		
		if(params.headers) 
		{
			performOnElsList(params.headers, function(header) {
				xmlhttp.setRequestHeader(header.key, header.value);	
			});
		}

		if (params.type && params.type.toString().toUpperCase() == 'POST')
		{
			xmlhttp.open(params.type, params.url, true);
			
			if(params.data) {
				dataToSend = objectToHttpParam(params.data);
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}

			if(params.formData) {
				dataToSend = params.formData;
				// don't set content type as it will miss 'boundary' value
				//xmlhttp.setRequestHeader("Content-type", "multipart/form-data");
			}
		}
		else
		{
			xmlhttp.open(params.type, params.url + objectToHttpParam(params.data), true);
		}
		
		xmlhttp = Ajax.beforeSend(xmlhttp, params.type, dataToSend);
		
		xmlhttp.send(dataToSend);
		
		return xmlhttp;
	};
	
	this.onloadHandlersList = [];
	this.onErrorHandlersList = [];
	this.beforeSendHandlersList = [];
	
	this.beforeSend = function(xmlhttp, type, dataToSend) 
	{
		performOnElsList(this.beforeSendHandlersList, function(handler) {
			xmlhttp = handler(xmlhttp, type, dataToSend);
		});
		
		return xmlhttp;
	};
	
	this.onLoad = function(xmlhttp, params, callback, errorCallback) 
	{
		if(!xmlhttp.aborted) 
		{
			if(callback) 
			{
				var response = xmlhttp.responseText;
				
				if(params.expect == 'json') 
				{
					try {
						response = JSON.parse(xmlhttp.responseText);
						callback(response, xmlhttp.status);
					}
					catch(e) 
					{
						console.log(e);
						console.log(xmlhttp);

						performOnElsList(Ajax.onErrorHandlersList, function(handler) {
							handler(xmlhttp);
						});
					}
				}
				else 
				{
					callback(response, xmlhttp.status);
				}
			}
			
			performOnElsList(this.onloadHandlersList, function(handler) {
				handler(xmlhttp);
			});
		}
	};
};

var AjaxRequest = 
{
	url: null,			// 
	type: null,			// post, get
	expect: null,		// json, text
	data: null,			// 
	formData: null		// 
};
