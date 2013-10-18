var Popup = function ()
{
	var wordsTable = document.getElementById("TR-WordsList");
	var loadingView = document.getElementById("TR-LoadingView");
	var nowwordsView = document.getElementById("TR-NoWordsView");

	this.ShowLoadingView = function ()
	{
		loadingView.style.display = "block";
	},

	this.HideLoadingView = function ()
	{
		loadingView.style.display = "none";
	};

	this.ShowNoWordsView = function ()
	{
		nowwordsView.style.display = "block";
	};

	this.HideNoWordsView = function ()
	{
		nowwordsView.style.display = "none";
	};


	this.ShowUserWords = function ()
	{
		var popup = this;
		popup.ShowLoadingView();
		wordsTable.innerHTML = "";

		var db = new DB();

		db.GetWords(function (words)
		{
			if (words.length > 0)
			{
				popup.HideNoWordsView();

				for (var i = 0; i < words.length; i++)
				{
					var wordItem = words[i];

					var wordRow = "<tr>"
									+ "<td class='TR-Word-Cell'>"
										+ "<a class='TR-Word'>" + wordItem.word + "</a>"
									+ "</td>"
									+ "<td class='TR-Translation-Cell'>"
										+ "<span class='TR-Translation'>" + wordItem.meaning + "</span>"
										+ "<div class='TR-WordInfo'>" + new Date(wordItem.date).Ago() + "</div>"
									+"</td>"
									+ "<td class='TR-DeleteButton-Cell'>"
										+ "<button class='TR-KnowIt' word='" + wordItem.word + "'>Know it!</button>"
									+ "</td>"
								+ "</tr>";

					wordsTable.innerHTML += wordRow;
				}

				var deleteButtonsList = document.getElementsByClassName("TR-KnowIt");
				for (var y = 0; y < deleteButtonsList.length; y++)
				{
					var deleteButton = deleteButtonsList[y];
					deleteButton.addEventListener("click", function (event) { popup.DeleteWordFromTable(event); }, false);
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
		var word = event.target.getAttribute("word");

		var db = new DB();
		var frontendInstance = this;

		db.DeleteWord(word, function ()
		{
			frontendInstance.ShowUserWords();
		});
	};
};

window.onload = function ()
{
	var popup = new Popup();
	popup.ShowUserWords();
};