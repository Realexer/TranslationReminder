var frontend = new Frontend();

frontend.ShowHightlights();

document.onmouseup = function (event)
{
	frontend.SelectWordAction(event);
};