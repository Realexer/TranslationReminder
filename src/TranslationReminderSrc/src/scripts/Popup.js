var Popup = function ()
{
	var wordsTable = document.getElementById("words-list");
	var loadingView = document.getElementById("loading-view");

	this.ShowLoadingView = function (hide)
	{
		loadingView.style.display = "block";
	},

	this.HideLoadingView = function ()
	{
		loadingView.style.display = "none";
	};

	this.ShowUserWords = function ()
	{
		var popup = this;
		popup.ShowLoadingView();

		var db = new DB();

		db.GetWords(function (words)
		{
			for (var i = 0; i < words.length; i++)
			{
				var word = words[i].word;
				var meaning = words[i].meaning;

				if (word === 0)
					continue;

				var row = document.createElement("tr");

				var cell1 = document.createElement("td");
				var cell2 = document.createElement("td");
				var cell3 = document.createElement("td");

				cell1.className = "word";
				cell2.className = "meaning";
				cell3.className = "delete";

				cell1.appendChild(document.createTextNode(word));
				cell2.appendChild(document.createTextNode(meaning));
				cell3.appendChild(document.createTextNode("x"));
				cell3.style.color = "red";
				cell3.style.cursor = "pointer";

				cell3.setAttribute("word", word);
				cell3.addEventListener("click", function (event) { popup.DeleteWordFromTable(event); }, false);

				row.appendChild(cell1);
				row.appendChild(cell2);
				row.appendChild(cell3);

				wordsTable.appendChild(row);
			}

			popup.HideLoadingView();
		});
	};



	this.DeleteWordFromTable = function (event)
	{
		var cell = event.target;
		var word = cell.getAttribute("word");

		// TODO: this.delteWord(word);
		this.ShowUserWords();
	};
};

window.onload = function ()
{
	var popup = new Popup();
	popup.ShowUserWords();
};