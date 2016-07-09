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

		TemplatesLoader.loadTemplates("templates/popup.html", function() 
		{
			showUserWords();
		});
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

				performOnElsList(words, function(word, i) {
					word.rowClass = (i % 2 == 0) ? "TR-BG-Dark" : "TR-BG-Light";
					UIManager.addHTML(wordsTable, Register.templater.formatTemplate("WordRowItem", word));
				});

				performOnElsList(document.querySelectorAll(".TR-KnowIt"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						deleteWordFromTable(UIManager.getElData(button, "tr-word")); 
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