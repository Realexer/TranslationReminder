var Frontend = function ()
{
	this.classNames =
	{
		highlightedText: "TR-HighlightedText",
		hintClassName: "TR-Hint",
		newWordForm: {
			
		}
	};

	this.IDs =
	{
		newWordForm:
		{
			formHandler: "NewWordAddingForm", //""insertButton",
			titleHandler: "TitleHandler", //"insertButtonTitleHandler",
			title: "Title", //""insertButtonTitle",
			closeButton: "CloseButton", //"insertButtonClose",
			selectedText: "CurrentSelection", //" "current_selection",
			translationInput: "Translation", //""insertButtonValue",
			submitButton: "SubmitButton"//""insertButtonSubItem"
		}
	};

	this.currentSelection = null;

	this.textNodes = new Array();
	this.globalWords = new Array();

	var newWordAddingFormElement;


	this.GetWordAddingForm = function () { return document.getElementById(this.IDs.newWordForm.formHandler); };

	this.GetWordAddingFormCurrentSelection = function () { return document.getElementById(this.IDs.newWordForm.selectedText); };

	this.GetWordAddingFormTranslationInput = function () { return document.getElementById(this.IDs.newWordForm.translationInput); };

	this.GetWordAddingFormSubmitButton = function () { return document.getElementById(this.IDs.newWordForm.submitButton); };

	this.GetWordAddingFormCloseButton = function () { return document.getElementById(this.IDs.newWordForm.closeButton); };


	this.ShowHightlights = function ()
	{
		this.FindTexts(document.body);

		var db = new DB();
		var frontendInstance = this;
		db.GetWords(function (words)
		{
			frontendInstance.globalWords = words;

			for (var i = 0; i < frontendInstance.textNodes.length; i++)
			{
				frontendInstance.FindWordsInTextNodes(frontendInstance.textNodes[i]);
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
				var nodeValue = childNode.nodeValue.fullTrim();
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

	this.FindWordsInTextNodes = function (node)
	{
		var frontendInstance = this;
		var nodeText = new String(node.nodeValue);

		for (var i = 0; i < this.globalWords.length; i++)
		{
			var word = this.globalWords[i].word;
			var meaning = this.globalWords[i].meaning;

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

					if (leftPartOfText.length === 0 && rightPartOfText.length === 0)
					{
						if (node.parentNode)
						{
							if (node.parentNode.getAttribute("class") === this.classNames.highlightedText)
							{
								continue;
							}
						}
					}

					var newTextElementToReplacePrevious = document.createElement("span");
					if (leftPartOfText.length > 0)
					{
						leftTextElement = document.createTextNode(leftPartOfText);
						newTextElementToReplacePrevious.appendChild(leftTextElement);
					}

					var hightlightedTextElement = document.createElement("a");
					hightlightedTextElement.setAttribute("title", meaning);
					hightlightedTextElement.setAttribute("class", this.classNames.highlightedText);
					hightlightedTextElement.addEventListener("click", function (e) { frontendInstance.ShowHint(e); }, true);


					hightlightedTextElement.appendChild(document.createTextNode(matchedText));
					newTextElementToReplacePrevious.appendChild(hightlightedTextElement);

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
						this.FindWordsInTextNodes(leftTextElement);
					}

					if (rightPartOfText.length > 0)
					{
						this.FindWordsInTextNodes(rightTextElement);
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
		var highlightedElements = getElementsByClassName(document.body, "a", this.classNames.highlightedText);

		for (var i = 0; i < highlightedElements.length; i++)
		{
			var highlightedElem = highlightedElements[i];

			if (highlightedElem.firstChild.nodeValue.toLowerCase() == word.toLowerCase())
			{
				if (highlightedElem.parentNode)
				{
					var textNode = document.createTextNode(highlightedElem.firstChild.nodeValue);
					highlightedElem.parentNode.replaceChild(textNode, highlightedElem);
				}
			}
		}
	};

	this.SelectWord = function (event)
	{
		if (event.target.isHasInParents(this.GetWordAddingForm()))
			return false;

		if (!event.ctrlKey && !event.shiftKey)
		{
			this.HideNewWordAddingForm();
			this.currentSelection = null;
			return false;
		}

		this.currentSelection = window.getSelection().toString();

		if (this.currentSelection.length === 0)
		{
			this.HideNewWordAddingForm();
			this.currentSelection = null;
			return false;
		}

		this.CreateWordAddingForm();
		this.ShowNewWordAddingForm();
		
		var range = this.currentSelection.getRangeAt(0);

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

		this.GetWordAddingFormCurrentSelection().firstChild.nodeValue = this.currentSelection;
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
			 "<div class='TR-NewWordForm_handler' id='" + this.IDs.newWordForm.formHandler + "'>"
				+ "<div id='" + this.IDs.newWordForm.titleHandler + "' class='TR-NewWordForm_title'>"
					+ "<div style='float:left' id='" + this.IDs.newWordForm.title + "'>Remember</div>"
					+ "<div class='TR-NewWordForm_close_button' id='" + this.IDs.newWordForm.closeButton + "'> x</div>"
					+ "<div style='clear:both'></div> "
				+ "</div> "
				+ "<table class='TR-NewWordForm_word_table'>"
					+ "<tr>"
						+ "<td class='TR-NewWordForm_selected_word'>"
							+ "<div id='" + this.IDs.newWordForm.selectedText + "'>word</div>"
						+ "</td>"
					+ "</tr>"
				+ "</table>"
				+ "<table class='TR-NewWordForm_meaning_table'>"
					+ "<tr> "
						+ "<td class='TR-NewWordForm_input'>"
							+ "<b style='color:rgb(39, 150, 65);'>AS</b>"
							+ "<input value='' type='text' id='" + this.IDs.newWordForm.translationInput + "'/>"
						+ "</td>"
						+ "<td class='TR-NewWordForm_add_button'>"
							+ "<div id='" + this.IDs.newWordForm.submitButton + "'>+</div>"
						+ "</td>"
					+ "</tr>"
				+ "</table>"
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
		if (this.currentSelection.length > 0)
		{
			this.HideNewWordAddingForm();

			var meaning = this.GetWordAddingFormTranslationInput().value;

			if (meaning.fullTrim().length > 0)
			{
				var db = new DB();
				var frontendInstance = this;
				db.WriteWord(this.currentSelection, meaning, null, function ()
				{
					frontendInstance.ShowHightlights();
				});
			}
		}
	};


	this.ShowHint = function (event)
	{
		var curTarget = event.target;
		if (curTarget.className !== this.highlightedText)
			return;

		for (var i = 0; i < curTarget.childNodes.length; i++)
		{
			var child = curTarget.childNodes[i];
			if (child.className === this.hintClassName)
			{
				return;
			}
		}

		var hint = document.createElement("div");
		hint.innerHTML = "<table id='_ym_hint_table' style='width: 100%;border-collapse:collapse; min-width: 100px; max-width: 300px; border: 1px solid rgb(170, 170, 255); background: #fff;'><tr><td> " + curTarget.getAttribute("title") + "</td><td width='0.8em;' style='color:red;vertical-aligment:top; cursor:pointer; text-align:center;'><span style='text-align:center;' id='deleteWordSpan'>x</span></td></tr></table>";
		hint.setAttribute("class", this.hintClassName);
		hint.style.position = "absolute";
		hint.style.bottom = "1.3em";
		hint.style.right = "0em";
		hint.style.fontSize = "1em";
		hint.style.zIndex = 100;
		hint.id = "_ym_hint_div";


		curTarget.appendChild(hint);

		var frntnd = this;

		hint.addEventListener("click", function (e) { frntnd.DeleteHint(e); }, false);
		document.getElementById('_ym_hint_table').addEventListener("click", function (e) { frntnd.DeleteHint(e); }, false);
		document.getElementsByTagName("body")[0].addEventListener("click", function (e) { frntnd.DeleteHint(e); }, false);

		document.getElementById('deleteWordSpan').onclick = function ()
		{
			frntnd.DeleteWord(curTarget.firstChild.nodeValue);
			// TODO: opera.extension.postMessage({ action: "delete", word: curTarget.firstChild.nodeValue });
			DeleteWord(curTarget.firstChild.nodeValue);
		};
	};

	this.DeleteHint = function (event)
	{
		if (event.target.className === this.highlightedText)
		{
			return;
		}

		var hintTarget = document.getElementById("_ym_hint_div");

		if (hintTarget.className != this.hintClassName)
		{
			hintTarget = hintTarget.parentNode;
			if (hintTarget.className != this.hintClassName)
			{
				return;
			}
		}

		if (hintTarget)
		{
			hintTarget.parentNode.removeChild(hintTarget);
		}
	};


	this.DeleteWord = function (word)
	{
		// TODO: opera.extension.postMessage({ action: "delete", word: word });
	};

};