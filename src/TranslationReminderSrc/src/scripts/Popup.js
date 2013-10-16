var Popup = function ()
{
	var wordsTable = document.getElementById("TR-WordsList");
	var loadingView = document.getElementById("TR-LoadingView");
	var nowwordsView = document.getElementById("TR-NoWordsView");

	this.ShowLoadingView = function (hide)
	{
		loadingView.style.display = "block";
	},

	this.HideLoadingView = function ()
	{
		loadingView.style.display = "none";
	};

	this.ShowNoWordsView = function ()
	{
		loadingView.style.display = "block";
	};

	this.HideNoWordsView = function ()
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
			if (words.length > 0)
			{
				popup.HideNoWordsView();

				for (var i = 0; i < words.length; i++)
				{
					var word = words[i].word;
					var meaning = words[i].meaning;

					if (word === 0)
						continue;

					var row = document.createElement("tr");

					var wordCell = document.createElement("td");
					var translationCell = document.createElement("td");
					var deleteButtonCell = document.createElement("td");

					wordCell.className = "TR-Word-Cell";
					translationCell.className = "TR-Translation-Cell";
					deleteButtonCell.className = "TR-DeleteButton-Cell";

					wordCell.appendChild(document.createTextNode(word));
					translationCell.appendChild(document.createTextNode(meaning));
					deleteButtonCell.appendChild(document.createTextNode("x"));
					deleteButtonCell.style.cursor = "pointer";

					deleteButtonCell.setAttribute("word", word);
					deleteButtonCell.addEventListener("click", function (event) { popup.DeleteWordFromTable(event); }, false);

					row.appendChild(wordCell);
					row.appendChild(translationCell);
					row.appendChild(deleteButtonCell);

					wordsTable.appendChild(row);
				}
			}
			else
			{
				popup.ShowNoWordsView();
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