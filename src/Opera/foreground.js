var frontend = new Frontend();

opera.extension.onmessage = function (event)
{
	// Get content of incoming message.
	var message = event.data.message;
	var data = event.data.data;

	switch (message)
	{
		case "loaded":
			window.addEventListener("DOMContentLoaded", function ()
			{
				document.onmouseup = frontend.SelectWordAction;
				frontend.ShowHightlights();
			}, false);
			break;

		case "no_user":
			alert("First Log In or create New ID");
			break;

		case "writed":
			frontend.ShowHightlights();
			break;

		case "readed_on_page":
			frontend.RefreshCallback((data));
			break;

		case "readed_on_table":
			frontend.reloadTableCallback((data));
			break;

		case "deleted":
			frontend.RemoveHighLights(data);
			frontend.ShowHightlights();
			break;

		case "begin_synchronize":
			opera.extension.postMessage({ action: "synchronize", words: event.data.words });
			break;

		case "synchronized":
			frontend.DataSynchronized(data);
			frontend.ShowHightlights();
			break;

		case "logined":
			frontend.BackToMain();
			frontend.SynchonizeData();
			break;

		case "login_failed":
			alert("Cound not login. UserId does not exists");
			document.getElementById("_loading_view").style.display = "none";
			break;

		case "acc_created":
			frontend.BackToMain();
			frontend.SynchonizeData();
			break;

		case "acc_created_failed":
			alert("Cound not create account. Try another");
			document.getElementById("_loading_view").style.display = "none";
			break;

		case "show_username":
			frontend.ShowUserName(data);
			break;

		case "paste_username":
			frontend.PasteUserName(data);
			break;
	}
};