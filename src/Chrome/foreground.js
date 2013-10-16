var frontend = new Frontend();
chrome.extension.sendMessage(null, { name: "Hello", data: "My Data" }, function (response)
{
	console.log(response);
});

frontend.ShowHightlights();

document.onmouseup = function (event)
{
	frontend.SelectWordAction(event);
};