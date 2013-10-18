var Frontend = function ()
{
	this.classNames =
	{
		highlightedText: "TR-HighlightedText",
		common: {
			base: "TR-Common",
			green: "TR-Green",
			red: "TR-Red",
			clear: "TR-Clear",
			word: "TR-Word",
			translation: "TR-Translation",
			knowIt: "TR-KnowIt"
		},
		newWordForm: {
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-Title",
			titleText: "TR-NewWordForm-Title",
			formBody: "TR-NewWordForm-Body",
			selectedText: "TR-NewWordForm-CurrentSelection",
			translationInput: "TR-NewWordForm-Translation",
			closeButton: "TR-NewWordForm-CloseButton",
			addButton: "TR-NewWordForm-AddButton"
		},
		hint: {
			handler: "TR-Hint",
			deleteWord: "TR-Hint-DeleteWordButton",
			translation: "TR-Hint-Translation",
			infoBox: "TR-Hint-InfoBox"
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

	var newWordAddingFormElement;


	this.GetWordAddingForm = function () { return document.getElementById(this.IDs.newWordForm.form); };

	this.GetWordAddingFormCurrentSelection = function () { return document.getElementById(this.IDs.newWordForm.selectedText); };

	this.GetWordAddingFormTranslationInput = function () { return document.getElementById(this.IDs.newWordForm.translationInput); };

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
			var word = this.globalWords[i].word;
			var meaning = this.globalWords[i].meaning;

			if (word.trim().length == 0)
				continue;

			try
			{
				var pos = nodeText.toLowerCase().search(new RegExp(word.toLowerCase(), 'mg'));
				if (pos !== -1)
				{
					var leftPartOfText = nodeText.substr(0, pos);
					var rightPartOfText = nodeText.substr(pos + word.length, nodeText.length);
					var matchedText = nodeText.substr(pos, word.length);

					var leftTextElement = null,
						rightTextElement = null;

					if (node.parentNode)
					{
						if (node.parentNode.getAttribute("class") === this.classNames.highlightedText)
						{
							continue;
						}

						if (this.restrictedTags.indexOf(node.parentNode.tagName.toLowerCase()) !== -1)
						{
							continue;
						}
					}


					var newTextElementToReplacePrevious = document.createElement("span");
					if (leftPartOfText.length > 0)
					{
						leftTextElement = document.createTextNode(leftPartOfText);
						newTextElementToReplacePrevious.appendChild(leftTextElement);
					}

					var highlightedTextElement = document.createElement("trtag");
					highlightedTextElement.setAttribute("title", meaning);
					highlightedTextElement.setAttribute("class", this.classNames.highlightedText);
					highlightedTextElement.addEventListener("click", function (e) { frontendInstance.ShowHintAction(e); }, true);


					highlightedTextElement.appendChild(document.createTextNode(matchedText));
					newTextElementToReplacePrevious.appendChild(highlightedTextElement);

					if (rightPartOfText.length > 0)
					{
						rightTextElement = document.createTextNode(rightPartOfText);
						newTextElementToReplacePrevious.appendChild(rightTextElement);
					}

					if (node.parentNode)
					{
						node.parentNode.replaceChild(newTextElementToReplacePrevious, node);
					}

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
		if (event.target.hasInParents(this.classNames.newWordForm.form))
			return false;

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

		range.collapse(false);
		var offsets = range.getClientRects();
		var top = offsets[0].top - this.GetWordAddingForm().clientHeight + window.pageYOffset;
		var left = offsets[0].left;


		if (top < 0)
		{
			this.GetWordAddingForm().style.top = offsets[0].bottom + window.pageYOffset + "px";
		}
		else
		{
			this.GetWordAddingForm().style.top = top + "px";
		}

		if (parseInt(left + parseInt(this.GetWordAddingForm().clientWidth)) > parseInt(window.outerWidth))
		{
			var scrollWidth = 20;
			this.GetWordAddingForm().style.left = (parseInt(window.outerWidth) - parseInt(this.GetWordAddingForm().clientWidth)) - scrollWidth + "px";
		}
		else
		{
			this.GetWordAddingForm().style.left = left + "px";
		}

		this.GetWordAddingFormTranslationInput().focus();
	};

	this.ShowNewWordAddingForm = function ()
	{
		this.GetWordAddingForm().style.display = "table";
		this.GetWordAddingFormTranslationInput().value = "";

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
				+ "<span class='" + this.classNames.common.word + " " + this.classNames.newWordForm.selectedText + "' id='" + this.IDs.newWordForm.selectedText + "'>word</span>"
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
			this.HideNewWordAddingForm();

			var translation = this.GetWordAddingFormTranslationInput().value;

			if (translation.trim().length > 0)
			{
				var frontendInstance = this;

				chrome.extension.sendMessage(null, { name: "DB.AddWord", data: { word: frontendInstance.selectedText, translation: translation} },
				function ()
				{
					frontendInstance.ShowHightlights();
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

		var word = highlightedTextElement.getAttribute("title");

		var hint = document.createElement("div");
		hint.innerHTML = "<span class='" + this.classNames.common.translation + " " + this.classNames.hint.translation + "'>" + word + "</span>"
						+ "<div class='" + this.classNames.hint.infoBox + "'>"
							+ "<button class='" + this.classNames.common.knowIt + " " + this.classNames.hint.deleteWord + "' id='" + this.IDs.hint.deleteWord + "' word='" + word + "'>I already know this word!</button>"
						+ "</div>";

		hint.setAttribute("class", this.classNames.common.base + " " + this.classNames.hint.handler);
		hint.id = this.IDs.hint.handler;

		document.body.appendChild(hint);

		var highlightedTextElementRect = highlightedTextElement.getBoundingClientRect();
		var hintRect = hint.getBoundingClientRect();
		hint.style.left = (highlightedTextElementRect.right - highlightedTextElementRect.width / 2) + "px";
		hint.style.top = (highlightedTextElementRect.top - hintRect.height) + "px";

		var frntnd = this;

		hint.addEventListener("click", function (e) { frntnd.RemoveHintsAction(e); }, false);
		document.onclick = function (e) { frntnd.RemoveHintsAction(e); return false; };

		document.getElementById(this.IDs.hint.deleteWord).onclick = function (e)
		{
			frntnd.DeleteWord(e.target.getAttribute("word"));
		};
	};

	this.RemoveHintsAction = function (event)
	{
		if (event.target.hasInParents(this.classNames.highlightedText))
			return false;

		this.RemoveHints();
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

};