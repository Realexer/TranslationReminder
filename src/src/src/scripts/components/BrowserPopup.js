var BrowserPopup = function ()
{
	var wordsTableLearning = getEl("TR-WordsListLearning");
	var wordsTableLearned = getEl("TR-WordsListLearned");
	var loadingAnimation = getEl("TR-LoadingAnimation");
	var noWordsView = getEl("TR-NoWordsView");

	var currentWordsOrder =
	{
		field: WordsOrder.order.date,
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

			currentWordsOrder.field = WordsOrder.order.date;
			currentWordsOrder.switchDirection();

			showUserWords();
		});

		UIManager.addEventNoDefault(orderByHitsButton, "click", function ()
		{
			UIManager.removeClassFromEl(orderByDateButton, "TR-SelectedWordsOrder");
			UIManager.addClassToEl(orderByHitsButton, "TR-SelectedWordsOrder");
			
			currentWordsOrder.field = WordsOrder.order.hits;
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
		UIManager.clearEl(wordsTableLearning);
		UIManager.clearEl(wordsTableLearned);

		Register.wordsManager.GetWords(function (words)
		{
			if (words.length > 0)
			{
				UIManager.setHTML(getEl("TR-WordsCount"), words.length + " word" + (words.length > 1 ? "s" : ""));

				UIManager.hideEl(noWordsView);

				performOnElsList(words.filter(function(word) {
					return !word.learned;
				}), function(word, i) {
						word.rowClass = (i % 2 == 0) ? "TR-BG-Dark" : "TR-BG-Light";
						UIManager.addHTML(wordsTableLearning, Register.templater.formatTemplate("WordLearningRowItem", word));
				});

				performOnElsList(words.filter(function(word) {
					return word.learned;
				}), function(word, i) {
						word.rowClass = (i % 2 == 0) ? "TR-BG-Grey-Dark" : "TR-BG-Grey-Light";
						UIManager.addHTML(wordsTableLearned, Register.templater.formatTemplate("WordLearnedRowItem", word));
				});

				performOnElsList(document.querySelectorAll(".TR-KnowIt"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						markWordAsLearned(UIManager.getElData(button, "tr-word")); 
					});
				});
				
				performOnElsList(document.querySelectorAll(".TR-BackToLearning"), function(button) 
				{
					UIManager.addEventNoDefault(button, "click", function() {
						moveBackToLearning(UIManager.getElData(button, "tr-word")); 
					});
				});
			}
			else
			{
				UIManager.showEl(noWordsView);
			}

			UIManager.hideEl(loadingAnimation);
		}, {
			order: currentWordsOrder
		});
	};


	function markWordAsLearned(word)
	{
		Register.wordsManager.setWordLearned(word, function() {
			showUserWords();
		});
	};
	
	function moveBackToLearning(word)
	{
		Register.wordsManager.setWordLearning(word, function() {
			showUserWords();
		});
	};
};

window.onload = function ()
{
	var browserPopup = new BrowserPopup();
	browserPopup.Init();
};