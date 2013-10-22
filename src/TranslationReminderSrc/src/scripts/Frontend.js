var Frontend = function ()
{
	this.classNames =
	{
		highlightedText: "TR-HighlightedText",
		common: {
			base: "TR-Base",
			green: "TR-Green",
			red: "TR-Red",
			clear: "TR-Clear",
			word: "TR-Word",
			translation: "TR-Translation",
			knowIt: "TR-KnowIt",
			wordData: "TR-WordData",
			successful: "TR-Successful"
		},
		newWordForm: {
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-Title",
			titleText: "TR-NewWordForm-Title",
			formBody: "TR-NewWordForm-Body",
			selectedText: "TR-NewWordForm-CurrentSelection",
			specifiedTranslation: "TR-NewWordForm-SpecifiedTranslation",
			translationInput: "TR-NewWordForm-Translation",
			closeButton: "TR-NewWordForm-CloseButton",
			addButton: "TR-NewWordForm-AddButton"
		},
		hint: {
			handler: "TR-Hint",
			wordBaseInfo: "TR-WordBaseInfo",
			word: "TR-Hint-Word",
			translation: "TR-Hint-Translation",
			wordAdditionalInfo: "TR-WordAdditionalInfo",
			deleteWord: "TR-Hint-DeleteWordButton"
		}
	};

	this.IDs =
	{
		newWordForm:
		{
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-TitleHandler",
			titleText: "TR-NewWordForm-Title",
			closeButton: "TR-NewWordForm-CloseButton",
			selectedText: "TR-NewWordForm-CurrentSelection",
			specifiedTranslation: "TR-NewWordForm-SpecifiedTranslation",
			translationInput: "TR-NewWordForm-Translation",
			submitButton: "TR-NewWordForm-SubmitButton"
		},
		hint: {
			handler: "TR-Hint",
			deleteWord: "TR-Hint-DeleteWordButton"
		}
	};

	this.restrictedTags = ["style", "script", "object", "embed"];

	this.selectedText = null;

	this.textNodes = new Array();
	this.globalWords = new Array();
	this.wordsHits = {};

	var newWordAddingFormElement;


	this.GetWordAddingForm = function () { return document.getElementById(this.IDs.newWordForm.form); };

	this.GetWordAddingFormCurrentSelection = function () { return document.getElementById(this.IDs.newWordForm.selectedText); };

	this.GetWordAddingFormTranslationInput = function () { return document.getElementById(this.IDs.newWordForm.translationInput); };

	this.GetWordAddingFormSpecifiedTranslation = function () { return document.getElementById(this.IDs.newWordForm.specifiedTranslation); };

	this.GetWordAddingFormSubmitButton = function () { return document.getElementById(this.IDs.newWordForm.submitButton); };

	this.GetWordAddingFormCloseButton = function () { return document.getElementById(this.IDs.newWordForm.closeButton); };


	this.ShowHightlights = function ()
	{
		this.FindTexts(document.body);

		var frontendInstance = this;
		chrome.extension.sendMessage(null, { name: "DB.GetWords", data: null },
		function (words)
		{
			frontendInstance.globalWords = words;

			for (var i = 0; i < frontendInstance.textNodes.length; i++)
			{
				frontendInstance.HighlightTexts(frontendInstance.textNodes[i]);
			}

			for (var key in frontendInstance.wordsHits)
			{
				var wordHits = frontendInstance.wordsHits[key];
				chrome.extension.sendMessage(null, { name: "DB.UpdateWordHitCount", data: { word: key, hits: wordHits} }, function ()
				{
					console.log("Word hit counts updated");
				});
			}
		});
	};

	this.FindTexts = function (node)
	{
		for (var i = 0; i < node.childNodes.length; i++)
		{
			var childNode = node.childNodes[i];

			if (childNode.nodeType === 3) // 3 - is text node
			{
				var nodeValue = childNode.nodeValue.trim();

				if (nodeValue !== undefined && nodeValue.length > 0)
				{
					this.textNodes.push(childNode);
				}
			}
			else
			{
				this.FindTexts(childNode);
			}
		}
	};

	this.HighlightTexts = function (node)
	{
		var frontendInstance = this;
		var nodeText = new String(node.nodeValue);

		for (var i = 0; i < this.globalWords.length; i++)
		{
			var wordItem = this.globalWords[i];

			if (wordItem.word.trim().length == 0)
				continue;

			try
			{
				var pos = nodeText.toLowerCase().search(new RegExp("\\b" + wordItem.word.toLowerCase() + "\\b", "mg"));
				if (pos !== -1)
				{
					var leftPartOfText = nodeText.substr(0, pos);
					var rightPartOfText = nodeText.substr(pos + wordItem.word.length, nodeText.length);
					var matchedText = nodeText.substr(pos, wordItem.word.length);

					var leftTextElement = null,
						rightTextElement = null;

					if (node.parentNode)
					{
						if (node.parentNode.hasInParents(this.classNames.newWordForm.form)
							|| node.parentNode.getAttribute("class") === this.classNames.highlightedText
							|| this.restrictedTags.indexOf(node.parentNode.tagName.toLowerCase()) !== -1)
						{
							continue;
						}


						var newTextElementToReplacePrevious = document.createElement("trtag");
						if (leftPartOfText.length > 0)
						{
							leftTextElement = document.createTextNode(leftPartOfText);
							newTextElementToReplacePrevious.appendChild(leftTextElement);
						}

						var highlightedTextElement = document.createElement("trtag");
						highlightedTextElement.setAttribute("word", wordItem.word);
						highlightedTextElement.setAttribute("translation", wordItem.translation);
						highlightedTextElement.setAttribute("hits", wordItem.hits);
						highlightedTextElement.setAttribute("date", wordItem.date);

						highlightedTextElement.setAttribute("title", wordItem.translation);
						highlightedTextElement.setAttribute("class", this.classNames.highlightedText);
						highlightedTextElement.addEventListener("click", function(e) { frontendInstance.ShowHintAction(e); }, true);


						highlightedTextElement.appendChild(document.createTextNode(matchedText));
						newTextElementToReplacePrevious.appendChild(highlightedTextElement);

						// increase word hits count
						if (!this.wordsHits[wordItem.word])
						{
							this.wordsHits[wordItem.word] = parseInt(wordItem.hits) + 1;
						}
						else
						{
							this.wordsHits[wordItem.word] += 1;
						}

						if (rightPartOfText.length > 0)
						{
							rightTextElement = document.createTextNode(rightPartOfText);
							newTextElementToReplacePrevious.appendChild(rightTextElement);
						}

						node.parentNode.replaceChild(newTextElementToReplacePrevious, node);

						if (leftPartOfText.length > 0)
						{
							this.HighlightTexts(leftTextElement);
						}

						if (rightPartOfText.length > 0)
						{
							this.HighlightTexts(rightTextElement);
						}
					}
				}
			}
			catch (error)
			{
				console.log(error);
				continue;
			}
		}
	};

	this.RemoveHighLights = function (word)
	{
		var highlightedElements = document.getElementsByClassName(this.classNames.highlightedText);

		for (var i = 0; i < highlightedElements.length; i++)
		{
			var highlightedElem = highlightedElements[i];

			if (highlightedElem.firstChild.nodeValue.toLowerCase() == word.toLowerCase())
			{
				if (highlightedElem.parentNode)
				{
					var textNode = document.createTextNode(highlightedElem.firstChild.nodeValue);
					highlightedElem.parentNode.replaceChild(textNode, highlightedElem);
					i--;
				}
			}
		}
	};

	this.SelectWordAction = function (event)
	{
		if (event.target.hasInParents(this.classNames.newWordForm.form) || event.target.hasInParents(this.classNames.hint.handler))
			return false;

		this.RemoveHints();

		if (!event.ctrlKey)
		{
			this.HideNewWordAddingForm();
			this.selectedText = null;
			return false;
		}

		var selection = window.getSelection();
		this.selectedText = selection.toString().trim();

		if (this.selectedText.length === 0)
		{
			this.HideNewWordAddingForm();
			this.selectedText = null;
			return false;
		}

		this.CreateWordAddingForm();
		this.ShowNewWordAddingForm();

		var range = selection.getRangeAt(0);
		var selectionRect = range.getBoundingClientRect();

		// in Google Translate selectionRect is filled with zeros. Reason unknown. 
		// Trying to solve by using event coordiates to find out where to show the form
		if (selectionRect.left == 0 && selectionRect.top == 0)
		{
			selectionRect =
			{
				left: event.x,
				top: event.y,
				width: 0,
				height: 0
			};
		}

		var formRect = this.GetWordAddingForm().getBoundingClientRect();
		this.GetWordAddingForm().style.left = (window.scrollX + selectionRect.right - selectionRect.width / 2) + "px";
		this.GetWordAddingForm().style.top = (window.scrollY + selectionRect.top - formRect.height) + "px";

		this.GetWordAddingFormTranslationInput().focus();
	};

	this.ShowNewWordAddingForm = function ()
	{
		this.GetWordAddingForm().style.display = "table";
		this.GetWordAddingFormTranslationInput().value = "";
		this.GetWordAddingFormSpecifiedTranslation().innerHTML = "";

		this.GetWordAddingFormCurrentSelection().firstChild.nodeValue = this.selectedText;
	};

	this.HideNewWordAddingForm = function ()
	{
		if (this.GetWordAddingForm())
		{
			this.GetWordAddingForm().style.display = "none";
			this.GetWordAddingFormCurrentSelection().firstChild.nodeValue = "";
		}
	};


	this.CreateWordAddingForm = function ()
	{
		if (!newWordAddingFormElement)
		{
			newWordAddingFormElement = document.createElement("div");
			newWordAddingFormElement.innerHTML =
			 "<div class='" + this.classNames.common.base + " " + this.classNames.newWordForm.form + "' id='" + this.IDs.newWordForm.form + "'>"
				+ "<div class='" + this.classNames.newWordForm.title + "' id='" + this.IDs.newWordForm.title + "'>"
					+ "<span class='" + this.classNames.newWordForm.titleText + "' id='" + this.IDs.newWordForm.titleText + "'>add translaton to the word</span>"
					+ "<button class='" + this.classNames.common.red + " " + this.classNames.newWordForm.closeButton + "' id='" + this.IDs.newWordForm.closeButton + "'>x</button>"
					+ "<div class='" + this.classNames.common.clear + "'></div> "
				+ "</div> "
				+ "<div class='" + this.classNames.newWordForm.formBody + "'>"
				+ "<div class='" + this.classNames.newWordForm.selectedText + "'>"
					+ "<span class='" + this.classNames.common.word + "' id='" + this.IDs.newWordForm.selectedText + "'>word</span>"
					+ " - "
					+ "<span class='" + this.classNames.common.translation + " " + this.classNames.newWordForm.specifiedTranslation + "' id='" + this.IDs.newWordForm.specifiedTranslation + "'></span>"
				+ "</div>"
				+ "<input class='" + this.classNames.common.translation + " " + this.classNames.newWordForm.translationInput + "' id='" + this.IDs.newWordForm.translationInput + "' value='' type='text' placeholder='translation'/>"
				+ "<button class='" + this.classNames.common.green + " " + this.classNames.newWordForm.addButton + "' id='" + this.IDs.newWordForm.submitButton + "'>+</button>"
				+ "</div>"
			+ "</div>";
		}

		if (!this.GetWordAddingForm())
		{
			var frontendInstance = this;

			newWordAddingFormElement.id = this._YM_newWordFormID;
			document.body.appendChild(newWordAddingFormElement);

			this.GetWordAddingFormSubmitButton().onclick = function () { frontendInstance.AddWord(); };

			this.GetWordAddingFormTranslationInput().oninput = function ()
			{
				frontendInstance.GetWordAddingFormSpecifiedTranslation().innerHTML = frontendInstance.GetWordAddingFormTranslationInput().value;
			};

			this.GetWordAddingFormTranslationInput().onkeydown = function (event)
			{
				if (event.keyCode === 13) // enter
				{
					frontendInstance.AddWord();
				}

				if (event.keyCode === 27) // escape
				{
					frontendInstance.HideNewWordAddingForm();
				}
			};

			this.GetWordAddingFormCloseButton().onclick = function () { frontendInstance.HideNewWordAddingForm(); };
		}
	};

	this.AddWord = function ()
	{
		if (this.selectedText.length > 0)
		{
			var translation = this.GetWordAddingFormTranslationInput().value;

			if (translation.trim().length > 0)
			{
				var frontendInstance = this;

				chrome.extension.sendMessage(null, { name: "DB.AddWord", data: { word: frontendInstance.selectedText, translation: translation} },
				function ()
				{
					frontendInstance.ShowHightlights();
					frontendInstance.GetWordAddingForm().classList.add(frontendInstance.classNames.common.successful);

					setTimeout(function ()
					{
						frontendInstance.HideNewWordAddingForm();
						frontendInstance.GetWordAddingForm().classList.remove(frontendInstance.classNames.common.successful);
					}, 120);
				});
			}
		}
	};


	this.ShowHintAction = function (event)
	{
		var highlightedTextElement = event.target;
		if (highlightedTextElement.className !== this.classNames.highlightedText)
			return false;

		if (event.target.hasInChildren(this.classNames.hint.handler)) // hint already displaied
			return false;

		var word = highlightedTextElement.getAttribute("word");
		var translation = highlightedTextElement.getAttribute("translation");
		var hits = highlightedTextElement.getAttribute("hits");
		var date = parseInt(highlightedTextElement.getAttribute("date"));

		var hint = document.createElement("div");
		hint.innerHTML = "<div class='" + this.classNames.hint.wordBaseInfo + "'>"
							+ "<span class='" + this.classNames.common.word + " " + this.classNames.hint.word + "'>" + word + "</span> <span class='" + this.classNames.common.translation + " " + this.classNames.hint.translation + "'>" + translation + "</span>"
						+ "</div>"
						+ "<div class='" + this.classNames.hint.wordAdditionalInfo + "'>"
							+ "<div class='" + this.classNames.common.wordData + "'>" + hits + " times met<br/>" + new Date(date).Ago() + "</div>"
							+ "<button class='" + this.classNames.common.knowIt + " " + this.classNames.hint.deleteWord + "' id='" + this.IDs.hint.deleteWord + "' word='" + word + "'>I already know this word!</button>"
							+ "<div class='" + this.classNames.common.clear + "'></div>"
						+ "</div>";

		hint.setAttribute("class", this.classNames.common.base + " " + this.classNames.hint.handler);
		hint.id = this.IDs.hint.handler;

		document.body.appendChild(hint);

		var highlightedTextElementRect = highlightedTextElement.getBoundingClientRect();
		var hintRect = hint.getBoundingClientRect();
		hint.style.left = (window.scrollX + highlightedTextElementRect.right - highlightedTextElementRect.width / 2) + "px";
		hint.style.top = (window.scrollY + highlightedTextElementRect.top - hintRect.height) + "px";

		var frontendInstance = this;

		document.getElementById(this.IDs.hint.deleteWord).onclick = function (e)
		{
			frontendInstance.DeleteWord(e.target.getAttribute("word"));
		};
	};


	this.RemoveHints = function ()
	{
		var allHints = document.getElementsByClassName(this.classNames.hint.handler);

		for (var i = 0; i < allHints.length; i++)
		{
			var hint = allHints[i];
			hint.parentNode.removeChild(hint);
			i--;
		}
	};


	this.DeleteWord = function (word)
	{
		var frontendInstance = this;

		chrome.extension.sendMessage(null, { name: "DB.DeleteWord", data: { word: word} },
		function ()
		{
			frontendInstance.RemoveHighLights(word);
			frontendInstance.ShowHightlights();
			frontendInstance.RemoveHints();
		});
	};


	/*
	var allHightlightTexts = document.getElementsByClassName(frontendInstance.classNames.highlightedText);

for (var i = 0; i < allHightlightTexts.length; i++)
{
	var highlightedText = allHightlightTexts[i];
	highlightedText.onclick = function (e) { frontendInstance.ShowHintAction(e); };
}

this.HighlightTextsAlt = function (node)
{
	var frontendInstance = this;
	var nodeText = new String(node.nodeValue);

	for (var i = 0; i < this.globalWords.length; i++)
	{
		var wordItem = this.globalWords[i];

		if (wordItem.word.trim().length == 0)
			continue;

		try
		{
			if (node.parentNode)
			{
				if (node.parentNode.hasInParents(this.classNames.newWordForm.form) ||
						node.parentNode.getAttribute("class") === this.classNames.highlightedText ||
						this.restrictedTags.indexOf(node.parentNode.tagName.toLowerCase()) !== -1)
				{
					continue;
				}

				node.parentNode.innerHTML = nodeText.replace(new RegExp("\\b" + wordItem.word + "\\b", "mgi"), function (match, offset, string)
				{
					return "<trtag"
								+ " word='" + wordItem.word + "'"
								+ " translation='" + wordItem.translation + "'"
								+ " hits='" + wordItem.hits + "'"
								+ " date='" + wordItem.date + "'"
								+ " title='" + wordItem.translation + "'"
								+ " class='" + frontendInstance.classNames.highlightedText + "'>"
								+ match + "</trtag>";
				});

				// increase word hits count
				if (!this.wordsHits[wordItem.word])
				{
					this.wordsHits[wordItem.word] = parseInt(wordItem.hits) + 1;
				}
				else
				{
					this.wordsHits[wordItem.word] += 1;
				}
			}
		}
		catch (error)
		{
			console.log(error);
			continue;
		}
	}
};
	*/
};