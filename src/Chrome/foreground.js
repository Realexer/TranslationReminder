/*chrome.extension.onMessage.addListener(function (message, sender, callback)
{
	console.log(message);
	console.log(sender);
	console.log(callback);
});*/

window.onload = function ()
{
	chrome.extension.sendMessage(null, "Hellow", function (response)
	{
		console.log(response);
	});

	var frontend = new Frontend();
	document.onmouseup = function (event)
	{
		with (frontend) 
		{
			frontend.SelectWord(event);	
		}
	};
};