var Popup = new function ()
{
	this.ShowWordsTable = function ()
	{
		var wordsView = document.getElementById("words-list");

		with (wordsView.style)
		{
			display = display == "none" ? "table" : "none";
		}

		this.ReloadWordsTable();
	};

	this.ReloadWordsTable = function ()
	{
		
		document.getElementById("no-words-view").style.display = "block";	
	};

	this.reloadTableCallback = function (words)
	{
		var wordsTable = document.getElementById("your_meaning_words_");

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
			cell3.addEventListener("click", DeleteWordFromTable, false);

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(cell3);

			wordsTable.appendChild(row);
		}

		document.getElementById("_loading_view").style.display = "none";
	};



	this.DeleteWordFromTable = function (event)
	{
		var cell = event.target;
		var word = cell.getAttribute("word");

		// TODO: this.delteWord(word);
	};

};