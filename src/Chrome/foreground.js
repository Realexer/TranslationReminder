var frontend = new Frontend();

frontend.ShowHightlights();

document.onmouseup = function (event)
{
	frontend.SelectWordAction(event);
};

chrome.runtime.onMessage.addListener(function (message, sender, callback)
{
	switch (message.name)
	{
		case "Frontend.SetupNewWordAddingFormWithCurrentSelection":
			frontend.SetupNewWordAddingFormWithCurrentSelection();
			break;
	}
	
	return true;
});