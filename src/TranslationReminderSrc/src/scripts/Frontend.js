var Frontend = function ()
{
	this.selectedText = null;

	this.textNodes = new Array();
	this.globalWords = new Array();
	this.wordsHits = {};

	var newWordAddingFormElement;


	this.GetWordAddingForm = function () { return document.getElementById(Props.IDs.newWordForm.form); };

	this.GetWordAddingFormCurrentSelection = function () { return document.getElementById(Props.IDs.newWordForm.selectedText); };

	this.GetWordAddingFormTranslationInput = function () { return document.getElementById(Props.IDs.newWordForm.translationInput); };

	this.GetWordAddingFormSpecifiedTranslation = function () { return document.getElementById(Props.IDs.newWordForm.specifiedTranslation); };

	this.GetWordAddingFormSubmitButton = function () { return document.getElementById(Props.IDs.newWordForm.submitButton); };

	this.GetWordAddingFormCloseButton = function () { return document.getElementById(Props.IDs.newWordForm.closeButton); };

	this.GetLoadingAnimationImage = function () { return document.getElementById(Props.IDs.newWordForm.loadingAnimation); };
	this.ShowLoadingAnimation = function () { this.GetLoadingAnimationImage().style.display = "block"; };
	this.HideLoadingAnimation = function () { this.GetLoadingAnimationImage().style.display = "none"; };

	this.ShowHightlights = function ()
	{
		this.textNodes = new Array();
		this.globalWords = new Array();

		this.FindTexts(document.body);

		var frontendInstance = this;
		chrome.runtime.sendMessage({ name: "DB.GetWords", data: null },
		function (words)
		{
			chrome.runtime.sendMessage({ name: "DB.GetSitesBlackList" }, function (sites)
			{
				if (sites.indexOf(document.domain) == -1)
				{
					frontendInstance.globalWords = words;

					for (var i = 0; i < frontendInstance.textNodes.length; i++)
					{
						frontendInstance.HighlightTexts(frontendInstance.textNodes[i]);
					}

					for (var key in frontendInstance.wordsHits)
					{
						var wordHits = frontendInstance.wordsHits[key];
						chrome.runtime.sendMessage({ name: "DB.UpdateWordHitCount", data: { word: key, hits: wordHits} }, function ()
						{
							console.log("Word hit counts updated");
						});
					}

					var allHightlightTexts = document.getElementsByClassName(Props.classNames.highlightedText);

					for (var i = 0; i < allHightlightTexts.length; i++)
					{
						var highlightedText = allHightlightTexts[i];
						highlightedText.onclick = function (e) { frontendInstance.ShowHintAction(e); };
					}
				}
			});
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
		try
		{
			var frontendInstance = this;

			if (node.parentNode)
			{
				var resultInnerHTML = node.parentNode.innerHTML;

				if (node.parentNode.hasInParents(Props.classNames.newWordForm.form) ||
					node.parentNode.hasInParents(Props.classNames.highlightedText) ||
					Props.restrictedTags.indexOf(node.parentNode.tagName.toLowerCase()) !== -1)
				{
					return;
				}

				var replacementRequired = false;

				for (var i = 0; i < this.globalWords.length; i++)
				{
					var wordItem = this.globalWords[i];

					if (wordItem.word.trim().length == 0)
						continue;

					// split by trtags in order to prevent replacing content insdie of trtags
					var resultInnerHTMLSplitted = resultInnerHTML.split(new RegExp("(<trtag[^<]*)", "mgi"));

					for (var j = 0; j < resultInnerHTMLSplitted.length; j++)
					{
						if (resultInnerHTMLSplitted[j].search("<trtag"))
						{
							if (frontendInstance.IsHTMLContainsWord(resultInnerHTMLSplitted[j], wordItem))
							{
								resultInnerHTMLSplitted[j] = frontendInstance.ReplaceHTMLWithHightlightedTexts(resultInnerHTMLSplitted[j], wordItem);
								replacementRequired = true;
							}
						}
					}

					resultInnerHTML = resultInnerHTMLSplitted.join("");
				}

				if (replacementRequired)
				{
					node.parentNode.innerHTML = resultInnerHTML;
				}
			}
		}
		catch (error)
		{
			console.log(error);
		}
	};

	this.IsHTMLContainsWord = function (resultInnerHTML, wordItem)
	{
		return (resultInnerHTML.search(new RegExp("\\b" + wordItem.word + "\\b", "mgi")) !== -1);
	};

	this.ReplaceHTMLWithHightlightedTexts = function (resultInnerHTML, wordItem)
	{
		resultInnerHTML = resultInnerHTML.replace(new RegExp("\\b" + wordItem.word + "\\b", "mgi"), function (match, offset, string)
		{
			return "<trtag"
				+ " word='" + wordItem.word + "'"
				+ " translation='" + wordItem.translation + "'"
				+ " hits='" + wordItem.hits + "'"
				+ " date='" + wordItem.date + "'"
				+ " title='" + wordItem.translation + "'"
				+ " class='" + Props.classNames.highlightedText + "'>"
				+ match + "</trtag>";
		});

		this.IncreaseWordHitsCount(wordItem);

		return resultInnerHTML;
	};

	this.IncreaseWordHitsCount = function (wordItem)
	{
		if (!this.wordsHits[wordItem.word])
		{
			this.wordsHits[wordItem.word] = parseInt(wordItem.hits) + 1;
		}
		else
		{
			this.wordsHits[wordItem.word] += 1;
		}
	};


	this.RemoveHighLights = function (word)
	{
		/// <summary>
		/// if word is null - all highlights will be removed
		/// </summary>
		/// <param name="word"></param>

		var highlightedElements = document.getElementsByClassName(Props.classNames.highlightedText);

		for (var i = 0; i < highlightedElements.length; i++)
		{
			var highlightedElem = highlightedElements[i];

			if (word == null || highlightedElem.firstChild.nodeValue.toLowerCase() == word.toLowerCase())
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
		if (event.target.hasInParents(Props.classNames.newWordForm.form) || event.target.hasInParents(Props.classNames.hint.handler))
			return false;

		this.RemoveHints();

		if (!event.ctrlKey)
		{
			this.HideNewWordAddingForm();
			this.selectedText = null;
			return false;
		}

		this.SetupNewWordAddingForm();
	};

	this.SetupNewWordAddingForm = function ()
	{
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

		var frontendInstance = this;
		chrome.runtime.sendMessage({ name: "DB.IsAutotranslationEnabled" }, function (isEnabled)
		{
			if (isEnabled)
			{
				frontendInstance.PerformWordTranslation();
			}
		});
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
				"<div class='" + Props.classNames.newWordForm.title + "' id='" + Props.IDs.newWordForm.title + "'>"
					+ "<span class='" + Props.classNames.newWordForm.titleText + "' id='" + Props.IDs.newWordForm.titleText + "'>add translaton to the word</span>"
					+ "<button class='" + Props.classNames.common.red + " " + Props.classNames.newWordForm.closeButton + "' id='" + Props.IDs.newWordForm.closeButton + "'>close</button>"
					+ "<div class='" + Props.classNames.common.clear + "'></div> "
				+ "</div> "
				+ "<div class='" + Props.classNames.newWordForm.formBody + "'>"
					+ "<div class='" + Props.classNames.common.bgDark + " " + Props.classNames.newWordForm.selectedText + "'>"
						+ "<span class='" + Props.classNames.common.word + "' id='" + Props.IDs.newWordForm.selectedText + "'>word</span>"
						+ " - "
						+ "<span class='" + Props.classNames.common.translation + " " + Props.classNames.newWordForm.specifiedTranslation + "' id='" + Props.IDs.newWordForm.specifiedTranslation + "'></span>"
					+ "</div>"
					+ "<div class='" + Props.classNames.newWordForm.buttonsPanel + "'>"
						+ "<span>Translate with: </span>"
						+ "<button class='" + Props.classNames.newWordForm.bingButton + "' id='" + Props.IDs.newWordForm.bingButton + "'><img src='data:image/png;base64," + Props.BingIconBase64 + "'/></button>"
						+ "<img class='" + Props.classNames.newWordForm.loadingAnimation + " " + Props.classNames.common.loadingAnimation + "' id='" + Props.classNames.newWordForm.loadingAnimation + "' src='data:image/gif;base64," + Props.LoadingAnimationBase64 + "'/>"
					+ "</div>"
					+ "<input class='" + Props.classNames.common.translation + " " + Props.classNames.newWordForm.translationInput + "' id='" + Props.IDs.newWordForm.translationInput + "' value='' type='text' placeholder='translation (press enter)'/>"
				+ "</div>";
		}

		if (!this.GetWordAddingForm())
		{
			var frontendInstance = this;

			newWordAddingFormElement.id = Props.IDs.newWordForm.form;
			newWordAddingFormElement.className = Props.classNames.common.base + " " + Props.classNames.common.bgLight + " " + Props.classNames.newWordForm.form;
			document.body.appendChild(newWordAddingFormElement);

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

			var bingButton = document.getElementById(Props.IDs.newWordForm.bingButton);
			bingButton.onclick = function ()
			{
				frontendInstance.PerformWordTranslation();
			};

			this.GetWordAddingFormCloseButton().onclick = function () { frontendInstance.HideNewWordAddingForm(); };
		}
	};

	this.PerformWordTranslation = function ()
	{
		var frontendInstance = this;
		
		frontendInstance.ShowLoadingAnimation();
		new BingClient().Translate(frontendInstance.selectedText,
			function (result)
			{
				frontendInstance.GetWordAddingFormTranslationInput().value = result.trim("\"");
				frontendInstance.GetWordAddingFormSpecifiedTranslation().innerHTML = result.trim("\"");
				frontendInstance.GetWordAddingFormTranslationInput().focus();
				frontendInstance.HideLoadingAnimation();
			}
		);
	};

	this.AddWord = function ()
	{
		if (this.selectedText.length > 0)
		{
			var translation = this.GetWordAddingFormTranslationInput().value;

			if (translation.trim().length > 0)
			{
				var frontendInstance = this;

				chrome.runtime.sendMessage({ name: "DB.AddWord", data: { word: frontendInstance.selectedText, translation: translation} },
				function ()
				{
					frontendInstance.ShowHightlights();
					frontendInstance.GetWordAddingForm().classList.add(Props.classNames.common.successful);

					setTimeout(function ()
					{
						frontendInstance.HideNewWordAddingForm();
						frontendInstance.GetWordAddingForm().classList.remove(Props.classNames.common.successful);
					}, 50);
				});
			}
		}
	};


	this.ShowHintAction = function (event)
	{
		var highlightedTextElement = event.target;
		if (highlightedTextElement.className !== Props.classNames.highlightedText)
			return false;

		if (event.target.hasInChildren(Props.classNames.hint.handler)) // hint already displaied
			return false;

		var word = highlightedTextElement.getAttribute("word");
		var translation = highlightedTextElement.getAttribute("translation");
		var hits = highlightedTextElement.getAttribute("hits");
		var date = parseInt(highlightedTextElement.getAttribute("date"));

		var hint = document.createElement("div");
		hint.innerHTML = "<div class='" + Props.classNames.common.bgDark + " " + Props.classNames.hint.wordBaseInfo + "'>"
							+ "<span class='" + Props.classNames.common.word + " " + Props.classNames.hint.word + "'>" + word + "</span> <span class='" + Props.classNames.common.translation + " " + Props.classNames.hint.translation + "'>" + translation + "</span>"
						+ "</div>"
						+ "<div class='" + Props.classNames.hint.wordAdditionalInfo + "'>"
							+ "<div class='" + Props.classNames.common.wordData + "'>" + hits + " times met<br/>" + new Date(date).Ago() + "</div>"
							+ "<button class='" + Props.classNames.common.knowIt + " " + Props.classNames.hint.deleteWord + "' id='" + Props.IDs.hint.deleteWord + "' word='" + word + "'>I already know this word!</button>"
							+ "<div class='" + Props.classNames.common.clear + "'></div>"
						+ "</div>";

		hint.id = Props.IDs.hint.handler;
		hint.className = Props.classNames.common.bgLight + " " + Props.classNames.common.base + " " + Props.classNames.hint.handler;

		document.body.appendChild(hint);

		var highlightedTextElementRect = highlightedTextElement.getBoundingClientRect();
		var hintRect = hint.getBoundingClientRect();
		hint.style.left = (window.scrollX + highlightedTextElementRect.right - highlightedTextElementRect.width / 2) + "px";
		hint.style.top = (window.scrollY + highlightedTextElementRect.top - hintRect.height) + "px";

		var frontendInstance = this;

		document.getElementById(Props.IDs.hint.deleteWord).onclick = function (e)
		{
			frontendInstance.DeleteWord(e.target.getAttribute("word"));
		};
	};


	this.RemoveHints = function ()
	{
		var allHints = document.getElementsByClassName(Props.classNames.hint.handler);

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

		chrome.runtime.sendMessage({ name: "DB.DeleteWord", data: { word: word} },
		function ()
		{
			frontendInstance.RemoveHighLights(word);
			frontendInstance.ShowHightlights();
			frontendInstance.RemoveHints();
		});
	};
};