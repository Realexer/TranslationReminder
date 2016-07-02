var WebClient = function ()
{
	this.CreateAccount = function (userId, callback)
	{
		new Ajax().Invoke(
			{
				type: "POST",
				url: "http://lf.inegata.ru/YM/AddUser",
				data: {
					data: {
						userName: userId
					}
				}
			},
			function (data)
			{
				if (data == "1")
				{
					callback(true);
				}
				else
				{
					callback(false);
				}
			}
		);
	};

	this.Login = function (userId, callback)
	{
		new Ajax().Invoke(
			{
				type: "POST",
				url: "http://lf.inegata.ru/YM/CheckUser",
				data: {
					data: {
						userName: userId
					}
				}
			},
			function (data)
			{
				if (data == "1")
				{
					callback(true);
				}
				else
				{
					callback(false);
				}
			}
		);
	};


	this.GetAllWords = function (userId, data, callback)
	{
		new Ajax().Invoke(
			{
				type: "POST",
				url: "http://lf.inegata.ru/YM/UpdateWords",
				data: {
					data: {
						userName: userId,
						words: data.words
					}
				}
			},
			function (data)
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
			}
		);
	};
};
