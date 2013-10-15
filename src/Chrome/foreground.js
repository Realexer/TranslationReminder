/*chrome.extension.onMessage.addListener(function (message, sender, callback)
{
	console.log(message);
	console.log(sender);
	console.log(callback);
});*/

var frontend = new Frontend();
chrome.extension.sendMessage(null, "Hello", function (response)
{
	console.log(response);
});

frontend.ShowHightlights();

document.onmouseup = function (event)
{
	frontend.SelectWordAction(event);
};