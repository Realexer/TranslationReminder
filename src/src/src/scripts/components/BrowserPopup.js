var BrowserPopup = function ()
{
	var wordsTable = getEl("TR-WordsList");
	var loadingAnimation = getEl("TR-LoadingAnimation");
	var noWordsView = getEl("TR-NoWordsView");

	var currentWordsOrder =
	{
		by: WordsOrder.order.date,
		direction: WordsOrder.direction.DESC,
		
		switchDirection: function() 
		{
			this.direction = this.direction == WordsOrder.direction.DESC ? WordsOrder.direction.ASC : WordsOrder.direction.DESC;
		}
	};

	this.Init = function ()
	{
		var orderByDateButton = getEl("TR-OrderWordsByDate");
		var orderByHitsButton = getEl("TR-OrderWordsByHits");

		UIManager.addEventNoDefault(orderByDateButton, "click", function ()
		{
			UIManager.removeClassFromEl(orderByHitsButton, "TR-SelectedWordsOrder");
			UIManager.addClassToEl(orderByDateButton, "TR-SelectedWordsOrder");

			currentWordsOrder.by = WordsOrder.order.date;
			currentWordsOrder.switchDirection();

			showUserWords();
		});

		UIManager.addEventNoDefault(orderByHitsButton, "click", function ()
		{
			UIManager.removeClassFromEl(orderByDateButton, "TR-SelectedWordsOrder");
			UIManager.addClassToEl(orderByHitsButton, "TR-SelectedWordsOrder");
			
			currentWordsOrder.by = WordsOrder.order.hits;
			currentWordsOrder.switchDirection();

			showUserWords();
		});

		showUserWords();
	};


	function showUserWords()
	{
		UIManager.showEl(loadingAnimation);
		UIManager.clearEl(wordsTable);

		Register.wordsManager.GetWords(function (words)
		{
			if (words.length > 0)
			{
				UIManager.setHTML(getEl("TR-WordsCount"), words.length + " word" + (words.length > 1 ? "s" : ""));

				UIManager.hideEl(noWordsView);

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

				performOnElsList(document.querySelectorAll(".TR-KnowIt"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						deleteWordFromTable(UIManager.getElData(button, "data-word")); 
					});
				});
			}
			else
			{
				UIManager.showEl(noWordsView);
			}

			UIManager.hideEl(loadingAnimation);
		}, currentWordsOrder.by, currentWordsOrder.direction);
	};



	function deleteWordFromTable(word)
	{
		Register.wordsManager.DeleteWord(word, function() {
			showUserWords();
		});
	};
};

window.onload = function ()
{
	var browserPopup = new BrowserPopup();
	browserPopup.Init();
};