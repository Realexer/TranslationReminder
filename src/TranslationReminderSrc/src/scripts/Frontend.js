var Frontend = function ()
{
	var _this = this;

	var selectedText = null;

	var textNodes = new Array();
	var globalWords = new Array();
	var wordsHits = {};

	var newWordAddingFormElement;

	var wordAddingForm = function () { return document.getElementById(Props.IDs.newWordForm.form); };
	var wordAddingFormCurrentSelection = function () { return document.getElementById(Props.IDs.newWordForm.selectedText); };
	var wordAddingFormTranslationInput = function () { return document.getElementById(Props.IDs.newWordForm.translationInput); };
	var wordAddingFormSpecifiedTranslation = function () { return document.getElementById(Props.IDs.newWordForm.specifiedTranslation); };
	var wordAddingFormEnterKeyButton = function () { return document.getElementById(Props.IDs.newWordForm.enterKeyButton); };
	var wordAddingFormCloseButton = function () { return document.getElementById(Props.IDs.newWordForm.closeButton); };
	var loadingAnimationImage = function () { return document.getElementById(Props.IDs.newWordForm.loadingAnimation); };
	var bingButton = function () { return document.getElementById(Props.IDs.newWordForm.bingButton); };
	var translationLanguageSpan = function () { return document.getElementById(Props.IDs.newWordForm.translationLanguageSpan); };

	function showLoadingAnimation() { loadingAnimationImage().style.display = "block"; };
	function hideLoadingAnimation() { loadingAnimationImage().style.display = "none"; };

	function showHightlights()
	{
		textNodes = new Array();
		globalWords = new Array();

		findTexts(document.body);

		chrome.runtime.sendMessage({ name: "DB.GetWords", data: null },
		function (words)
		{
			chrome.runtime.sendMessage({ name: "DB.GetSitesBlackList" }, function (sites)
			{
				if (sites.indexOf(document.domain) == -1)
				{
					globalWords = words;

					for (var i = 0; i < textNodes.length; i++)
					{
						highlightTexts(textNodes[i]);
					}

					for (var key in wordsHits)
					{
						var wordHits = wordsHits[key];
						chrome.runtime.sendMessage({ name: "DB.UpdateWordHitCount", data: { word: key, hits: wordHits} }, function ()
						{
							console.log("Word hit counts updated");
						});
					}

					var allHightlightTexts = document.getElementsByClassName(Props.classNames.highlightedText);

					for (var i = 0; i < allHightlightTexts.length; i++)
					{
						var highlightedText = allHightlightTexts[i];
						highlightedText.onclick = function (e) { showHintAction(e); };
					}
				}
			});
		});
	};


	function findTexts(node)
	{
		for (var i = 0; i < node.childNodes.length; i++)
		{
			var childNode = node.childNodes[i];

			if (childNode.nodeType === 3) // 3 - is text node
			{
				var nodeValue = childNode.nodeValue.trim();

				if (nodeValue !== undefined && nodeValue.length > 0)
				{
					textNodes.push(childNode);
				}
			}
			else
			{
				findTexts(childNode);
			}
		}
	};

	function highlightTexts(node)
	{
		try
		{
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

				for (var i = 0; i < globalWords.length; i++)
				{
					var wordItem = globalWords[i];

					if (wordItem.word.trim().length == 0)
						continue;

					// split by trtags in order to prevent replacing content insdie of trtags
					var resultInnerHTMLSplitted = resultInnerHTML.split(new RegExp("(<trtag[^<]*)", "mgi"));

					for (var j = 0; j < resultInnerHTMLSplitted.length; j++)
					{
						if (resultInnerHTMLSplitted[j].search("<trtag"))
						{
							if (isHTMLContainsWord(resultInnerHTMLSplitted[j], wordItem))
							{
								resultInnerHTMLSplitted[j] = replaceHTMLWithHightlightedTexts(resultInnerHTMLSplitted[j], wordItem);
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

	function isHTMLContainsWord(resultInnerHTML, wordItem)
	{
		return (resultInnerHTML.search(new RegExp("\\b" + wordItem.word + "\\b", "mgi")) !== -1);
	};

	function replaceHTMLWithHightlightedTexts(resultInnerHTML, wordItem)
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

		increaseWordHitsCount(wordItem);

		return resultInnerHTML;
	};

	function increaseWordHitsCount(wordItem)
	{
		if (!wordsHits[wordItem.word])
		{
			wordsHits[wordItem.word] = parseInt(wordItem.hits) + 1;
		}
		else
		{
			wordsHits[wordItem.word] += 1;
		}
	};


	this.SelectWordAction = function (event)
	{
		if (event.target.hasInParents(Props.classNames.newWordForm.form) || event.target.hasInParents(Props.classNames.hint.handler))
			return false;

		removeHints();

		if (!event.ctrlKey)
		{
			hideNewWordAddingForm();
			selectedText = null;
			return false;
		}

		this.SetupNewWordAddingForm();
	};

	function showNewWordAddingForm()
	{
		wordAddingForm().style.display = "table";
		wordAddingFormTranslationInput().value = "";
		wordAddingFormSpecifiedTranslation().innerText = "";

		wordAddingFormCurrentSelection().firstChild.nodeValue = selectedText;

		chrome.runtime.sendMessage({ name: "DB.GetTranslationLanguage" }, function (lang)
		{
			translationLanguageSpan().innerHTML = "'" + lang.toUpperCase() + "'";
		});

		chrome.runtime.sendMessage({ name: "DB.IsAutotranslationEnabled" }, function (isEnabled)
		{
			if (isEnabled)
			{
				performWordTranslation();
			}
		});
	};

	function hideNewWordAddingForm()
	{
		if (wordAddingForm())
		{
			wordAddingForm().style.display = "none";
			wordAddingFormCurrentSelection().firstChild.nodeValue = "";
		}
	};


	function createWordAddingForm()
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
						+ "<button class='" + Props.classNames.common.action + " " + Props.classNames.newWordForm.bingButton + "' id='" + Props.IDs.newWordForm.bingButton + "'>"
						+ "Translate to <span id='" + Props.IDs.newWordForm.translationLanguageSpan + "'></span> with "
						+ "<img src='data:image/png;base64," + Props.BingIconBase64 + "'/>"
						+ "</button>"
						+ "<img class='" + Props.classNames.newWordForm.loadingAnimation + " " + Props.classNames.common.loadingAnimation + "' id='" + Props.classNames.newWordForm.loadingAnimation + "' src='data:image/gif;base64," + Props.LoadingAnimationBase64 + "'/>"
					+ "</div>"
					+ "<div class='" + Props.classNames.newWordForm.translationInputHandler + "'>"
					+ "<input class='" + Props.classNames.common.translation + " " + Props.classNames.newWordForm.translationInput + "' id='" + Props.IDs.newWordForm.translationInput + "' value='' type='text' placeholder='translation (press enter)'/>"
					+ "<button title='Add word' id='" + Props.IDs.newWordForm.enterKeyButton + "'>"
						+ "<img class='" + Props.classNames.newWordForm.enterKeyImg + "' src='data:image/png;base64," + Props.EnterIconBase64 + "'/>"
					+ "</button>"
					+ "</div>"
				+ "</div>";
		}

		if (!wordAddingForm())
		{
			newWordAddingFormElement.id = Props.IDs.newWordForm.form;
			newWordAddingFormElement.className = Props.classNames.common.base + " " + Props.classNames.common.bgLight + " " + Props.classNames.newWordForm.form;
			document.body.appendChild(newWordAddingFormElement);

			wordAddingFormTranslationInput().oninput = function ()
			{
				wordAddingFormSpecifiedTranslation().innerText = wordAddingFormTranslationInput().value;
			};

			wordAddingFormTranslationInput().onkeydown = function (event)
			{
				if (event.keyCode === 13) // enter
				{
					addWord();
				}

				if (event.keyCode === 27) // escape
				{
					hideNewWordAddingForm();
				}
			};

			wordAddingFormEnterKeyButton().onclick = function(event)
			{
				addWord();
			};

			bingButton().onclick = function ()
			{
				performWordTranslation();
			};

			wordAddingFormCloseButton().onclick = function () { hideNewWordAddingForm(); };
		}
	};

	function performWordTranslation()
	{
		showLoadingAnimation();
		new BingClient().Translate(selectedText,
			function (result)
			{
				wordAddingFormTranslationInput().value = result.trim("\"");
				wordAddingFormSpecifiedTranslation().innerText = result.trim("\"");
				wordAddingFormTranslationInput().focus();
				hideLoadingAnimation();
			}
		);
	};

	function addWord()
	{
		if (selectedText.length > 0)
		{
			var translation = wordAddingFormTranslationInput().value;

			if (translation.trim().length > 0)
			{
				chrome.runtime.sendMessage({ name: "DB.AddWord", data: { word: selectedText, translation: translation} },
				function ()
				{
					showHightlights();
					wordAddingForm().classList.add(Props.classNames.common.successful);

					setTimeout(function ()
					{
						hideNewWordAddingForm();
						wordAddingForm().classList.remove(Props.classNames.common.successful);
					}, 50);
				});
			}
		}
	};


	function showHintAction(event)
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

		document.getElementById(Props.IDs.hint.deleteWord).onclick = function (e)
		{
			deleteWord(e.target.getAttribute("word"));
		};
	};


	function removeHints()
	{
		var allHints = document.getElementsByClassName(Props.classNames.hint.handler);

		for (var i = 0; i < allHints.length; i++)
		{
			var hint = allHints[i];
			hint.parentNode.removeChild(hint);
			i--;
		}
	};


	function deleteWord(word)
	{
		chrome.runtime.sendMessage({ name: "DB.DeleteWord", data: { word: word} },
		function ()
		{
			_this.RemoveHighLights(word);
			showHightlights();
			removeHints();
		});
	};

	this.Init = function ()
	{
		showHightlights();
		document.body.onmouseup = function (event)
		{
			_this.SelectWordAction(event);
		};
	};

	this.SetupNewWordAddingForm = function ()
	{
		var selection = window.getSelection();
		selectedText = selection.toString().trim();

		if (selectedText.length === 0)
		{
			hideNewWordAddingForm();
			selectedText = null;
			return false;
		}

		createWordAddingForm();
		showNewWordAddingForm();

		var range = selection.getRangeAt(0);
		var selectionRect = range.getBoundingClientRect();

		// In textareas selectionRect is filled with zeros. Reason unknown. 
		// Trying to solve by using mouse coordiates to find the place where to show the form
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

		var formRect = wordAddingForm().getBoundingClientRect();
		wordAddingForm().style.left = (window.scrollX + selectionRect.right - selectionRect.width / 2) + "px";
		wordAddingForm().style.top = (window.scrollY + selectionRect.top - formRect.height) + "px";

		wordAddingFormTranslationInput().focus();
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
};