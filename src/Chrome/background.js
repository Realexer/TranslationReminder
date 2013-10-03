var webClient = new WebClient();
var db = new DB();
var toolBarButton = null;

window.addEventListener("load", function ()
{
	var UIItemProperties = {
		disabled: false,
		title: "Personal Dictionary",
		icon: "icons/icon_18.png",
		onclick: function (event)
		{

		},
		popup: {
			href: 'popup.html',
			width: '340px'
		}
	};

	toolBarButton = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(toolBarButton);

	opera.extension.onconnect = function (event)
	{
		event.source.postMessage({ message: "loaded", data: "true" });
	};

}, false);


opera.extension.onmessage = function (event)
{
	switch (event.data.action)
	{
		case "get":
			db.GetWords(event.data.backMessage, event);
			break;

		case "write":
			if (!db.WriteWord(event.data.word, event.data.meaning, event))
			{
				toolBarButton.click();
			}
			break;

		case "delete":
			db.DeleteWord(event.data.word, event);
			break;

		case "prepare_synchronize":
			webClient.synchronize(event);
			break;

		case "begin_synchronize":
			webClient.synchronize(event.data);
			break;

		case "synchronize":
			webClient.send(event);
			break;

		case "login":
			webClient.login(event.data.userId, event);
			break;

		case "createAcc":
			webClient.createAccount(event.data.userId, event);
			break;

		case "get_username":
			event.source.postMessage({ message: event.data.backMessage, data: db.GetUserID() });
			break;
	}
};