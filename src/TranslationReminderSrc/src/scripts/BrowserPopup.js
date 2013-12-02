var BrowserPopup = function ()
{
	var wordsTable = document.getElementById("TR-WordsList");
	var loadingAnimation = document.getElementById("TR-LoadingAnimation");
	var noWordsView = document.getElementById("TR-NoWordsView");

	var wordsOrder = 
	{
		by: "date",
		direction: "DESC"
	};


	function showLoadingAnimation() { loadingAnimation.style.display = "block"; };
	function hideLoadingAnimation() { loadingAnimation.style.display = "none"; };

	function showNoWordsView() { noWordsView.style.display = "block"; };
	function hideNoWordsView() { noWordsView.style.display = "none"; };

	this.Init = function ()
	{
		var orderByDateButton = document.getElementById("TR-OrderWordsByDate");
		var orderByHitsButton = document.getElementById("TR-OrderWordsByHits");

		orderByDateButton.onclick = function ()
		{
			orderByHitsButton.classList.remove("TR-SelectedWordsOrder");
			orderByDateButton.classList.add("TR-SelectedWordsOrder");
			wordsOrder.by = "date";
			wordsOrder.direction = wordsOrder.direction == "DESC" ? "ASC" : "DESC";

			showUserWords();
		};

		orderByHitsButton.onclick = function ()
		{
			orderByDateButton.classList.remove("TR-SelectedWordsOrder");
			orderByHitsButton.classList.add("TR-SelectedWordsOrder");
			wordsOrder.by = "hits";
			wordsOrder.direction = wordsOrder.direction == "DESC" ? "ASC" : "DESC";

			showUserWords();
		};

		showUserWords();
	};


	function showUserWords ()
	{
		showLoadingAnimation();
		wordsTable.innerHTML = "";

		var db = new DB();

		db.GetWords(function (words)
		{
			if (words.length > 0)
			{
				document.getElementById("TR-WordsCount").innerHTML = words.length + " word" + (words.length > 1 ? "s" : "");

				hideNoWordsView();

				for (var i = 0; i < words.length; i++)
				{
					var wordItem = words[i];

					var wordRow = "<tr class='" + ((i % 2 == 0) ? "TR-BG-Dark" : "TR-BG-Light") + "'>"
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
					deleteButton.addEventListener("click", function (event) { deleteWordFromTable(event.target.getAttribute("word")); }, false);
				}
			}
			else
			{
				showNoWordsView();
			}

			hideLoadingAnimation();
		}, this.wordsOrder.by, this.wordsOrder.direction);
	};



	function deleteWordFromTable (word)
	{
		new DB().DeleteWord(word, function ()
		{
			showUserWords();
		});
	};
};

window.onload = function ()
{
	var browserPopup = new BrowserPopup();
	browserPopup.Init();
};