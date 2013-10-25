var Popup = function ()
{
	var wordsTable = document.getElementById("TR-WordsList");
	var loadingView = document.getElementById("TR-LoadingView");
	var nowwordsView = document.getElementById("TR-NoWordsView");

	this.WordsOrder = {
		by: "date",
		direction: "DESC"
	};


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

	this.Init = function ()
	{
		var poppupInstance = this;

		var orderByDateButton = document.getElementById("TR-OrderWordsByDate");
		var orderByHitsButton = document.getElementById("TR-OrderWordsByHits");

		orderByDateButton.onclick = function ()
		{
			orderByHitsButton.classList.remove("TR-SelectedWordsOrder");
			orderByDateButton.classList.add("TR-SelectedWordsOrder");
			poppupInstance.WordsOrder.by = "date";
			poppupInstance.WordsOrder.direction = poppupInstance.WordsOrder.direction == "DESC" ? "ASC" : "DESC";
			
			poppupInstance.ShowUserWords();
		};

		orderByHitsButton.onclick = function ()
		{
			orderByDateButton.classList.remove("TR-SelectedWordsOrder");
			orderByHitsButton.classList.add("TR-SelectedWordsOrder");
			poppupInstance.WordsOrder.by = "hits";
			poppupInstance.WordsOrder.direction = poppupInstance.WordsOrder.direction == "DESC" ? "ASC" : "DESC";

			poppupInstance.ShowUserWords();
		};
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
				document.getElementById("TR-WordsCount").innerHTML = words.length + " words";

				popup.HideNoWordsView();

				for (var i = 0; i < words.length; i++)
				{
					var wordItem = words[i];

					var wordRow = "<tr>"
									+ "<td class='TR-Word-Cell'>"
										+ "<div class='TR-WordHandler'><span class='TR-Word'>" + wordItem.word + "</span></div>"
										+ "<div class='TR-WordData'>" + wordItem.hits + " times met<br/>" + new Date(wordItem.date).Ago() + "</div>"
									+ "</td>"
									+ "<td class='TR-Translation-Cell'>"
										+ "<span class='TR-Translation'>" + wordItem.translation + "</span>"
									+ "</td>"
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
		}, this.WordsOrder.by, this.WordsOrder.direction);
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
	popup.Init();
	popup.ShowUserWords();
};