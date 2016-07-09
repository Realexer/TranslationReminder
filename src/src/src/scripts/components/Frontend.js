var Frontend = function ()
{
	var _this = this;
	

	this.Init = function ()
	{
		this.loadTemplates(function() 
		{
			Register.templater = new Templater();
			Register.templater.prepareUI();
			
			Register.translationsHighlighter = new TranslationsHighlighter();
			Register.translationsHighlighter.init();

			Register.translationsAddingForm = new TranslationsAddingForm();
			Register.translationsAddingForm.init();
			
			UIManager.addEvent(document.body, "mouseup", function(event, el) 
			{
				if (event.target.hasInParents(Props.classNames.newWordForm.form) 
				|| event.target.hasInParents(Props.classNames.hint.handler))
					return false;

				Register.translationsHighlighter.hideHints();

				if (event.ctrlKey || event.metaKey)
				{
					Register.translationsAddingForm.SetupNewWordAddingForm();
				}
				else 
				{
					Register.translationsAddingForm.hideNewWordAddingForm();
				}
			});
		});
	};
	
	this.loadTemplates = function(callback) 
	{
		Ajax.Invoke({
			type: "GET",
			url: chrome.extension.getURL('templates/frontend.html')
		},
		function(html) 
		{
			UIManager.addNodeFromHTML(document.body, html);
			Initer.whenTrue(function() {
				return getEl("tr-templates") != null;
			}, callback);
		});
	};
};

var TranslationsHighlighter = function() 
{
	var _this = this;
	
	var textNodes = new Array();
	var globalWords = new Array();
	var wordsHits = {};
	
	this.init = function() 
	{
		this.showHighlights();
	};
	
	this.showHighlights = function()
	{
		textNodes = new Array();
		globalWords = new Array();

		findTexts(document.body);

		Register.wordsManager.GetWords(function(words) 
		{
			Register.settingsManager.GetSitesBlackList(function(sites) 
			{
				if (sites.indexOf(document.domain) == -1)
				{
					globalWords = words;

					for (var i = 0; i < textNodes.length; i++)
					{
						_this.highlightTextsInNode(textNodes[i]);
					}

					for (var word in wordsHits)
					{
						var wordHits = wordsHits[word];
						Register.wordsManager.UpdateWordHitCount(word, wordHits, function() {
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
	
	this.highlightTextsInNode = function(node)
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


	this.hideHints = function()
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
		Register.wordsManager.DeleteWord(word, 
		function ()
		{
			_this.RemoveHighLights(word);
			_this.showHighlights();
			_this.hideHints();
		});
	};

	

	
	/**
	 * If word is null all highlights will be removed
	 * 
	 * @param {type} word
	 * @returns {undefined}
	 */
	this.RemoveHighLights = function (word)
	{
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

var TranslationsAddingForm = function() 
{
	var _this = this;
	
	var selectedText = null;
	
	var translationFormHandler = function(handler)
	{
		var _this = this;
		
		this.handler = handler;
		this.form = handler.querySelector(".TR-NewWordForm");
		this.wordAddingFormCurrentSelection = handler.querySelector("._tr_textToTranslate");
		this.wordAddingFormTranslationInput = handler.querySelector("._tr_translationInput");
		this.wordAddingFormSpecifiedTranslation = handler.querySelector("._tr_textTranslation");
		this.wordAddingFormEnterKeyButton = handler.querySelector("._tr_setTranslationButton");
		this.wordAddingFormCloseButton = handler.querySelector("._tr_close");
		this.loadingAnimationImage = handler.querySelector("._tr_loading");
		this.bingButton = handler.querySelector("._tr_bingButton");
		this.translationLanguageSpan = handler.querySelector("._tr_translateTo");
		
		this.setup = function() 
		{
			UIManager.addEvent(this.wordAddingFormTranslationInput, "input", function() {
				UIManager.setHTML(_this.wordAddingFormSpecifiedTranslation, UIManager.getValue(_this.wordAddingFormTranslationInput));
			});
//			wordAddingFormTranslationInput().oninput = function ()
//			{
//				wordAddingFormSpecifiedTranslation().innerText = wordAddingFormTranslationInput().value;
//			};

			UIManager.addEvent(_this.wordAddingFormTranslationInput, "keydown", function() 
			{
				switch(event.keyCode) {
					case 13:
						Register.translationsAddingForm.addWord();
						break;
						
					case 27:
						Register.translationsAddingForm.hideNewWordAddingForm();
						break;
				}
			});
			
			UIManager.addEvent(_this.wordAddingFormEnterKeyButton, "click", function() 
			{
				Register.translationsAddingForm.addWord();
			});
			
			UIManager.addEvent(_this.bingButton, "click", function() {
				Register.translationsAddingForm.performWordTranslation();
			});

			UIManager.addEvent(_this.wordAddingFormCloseButton, "click", function () { 
				Register.translationsAddingForm.hideNewWordAddingForm(); 
			});
		};
		
		this.show = function() { UIManager.showEl(this.form, "table"); };
		this.hide = function() { UIManager.hideEl(this.form); };
		
		this.position = function(selection, event) 
		{
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

			var formRect = _this.form.getBoundingClientRect();
			UIManager.setStyle(_this.form, "left", (window.scrollX + selectionRect.right - selectionRect.width / 2), "px");
			UIManager.setStyle(_this.form, "top", (window.scrollY + selectionRect.top - formRect.height), "px");
		};

		this.showLoadingAnimation = function() { UIManager.showEl(this.loadingAnimationImage); };
		this.hideLoadingAnimation = function() { UIManager.hideEl(this.loadingAnimationImage); };
	};
	
	this.formHandler = null;
	
	this.init = function() 
	{
		var formEl = UIManager.addNodeFromHTML(document.body, Register.templater.formatTemplate("AddingTranslationForm", {
			config: {
				bingIcon: chrome.extension.getURL('imgs/bing_icon.png'),
				loadingAnimation: chrome.extension.getURL('imgs/loading.gif')
			}
		}));
			
		this.formHandler = new translationFormHandler(formEl);
		this.formHandler.setup();
	};
	
	this.SetupNewWordAddingForm = function (event)
	{
		var selection = window.getSelection();
		selectedText = selection.toString().trim();

		if (selectedText.length === 0)
		{
			_this.hideNewWordAddingForm();
			selectedText = null;
			return false;
		}
		
		this.showNewWordAddingForm();

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

		var formRect = _this.formHandler.form.getBoundingClientRect();
		UIManager.setStyle(_this.formHandler.form, "left", (window.scrollX + selectionRect.right - selectionRect.width / 2), "px");
		UIManager.setStyle(_this.formHandler.form, "top", (window.scrollY + selectionRect.top - formRect.height), "px");

		UIManager.setFocus(_this.formHandler.wordAddingFormTranslationInput);
	};
	
	this.showNewWordAddingForm = function()
	{
		_this.formHandler.show();
		
		UIManager.setValue(_this.formHandler.wordAddingFormTranslationInput, "");
		UIManager.clearEl(_this.formHandler.wordAddingFormSpecifiedTranslation);

		UIManager.setHTML(_this.formHandler.wordAddingFormCurrentSelection, selectedText);
		
		Register.settingsManager.GetTranslationLanguage(function (lang)
		{
			UIManager.setHTML(_this.formHandler.translationLanguageSpan, "'" + lang.toUpperCase() + "'");
		});

		Register.settingsManager.IsAutotranslationEnabled(function (isEnabled)
		{
			if (isEnabled) {
				_this.performWordTranslation();
			}
		});
	};

	this.hideNewWordAddingForm = function()
	{
		_this.formHandler.hide();
		UIManager.clearEl(_this.formHandler.wordAddingFormCurrentSelection);
		
		selectedText = null;
	};
	
	this.performWordTranslation = function()
	{
		_this.formHandler.showLoadingAnimation();
		Register.settingsManager.GetTranslationLanguage(function(toLang) 
		{
			new BingClient().Translate(selectedText, document.documentElement.lang, toLang,
			function (result)
			{
				var translation = result.trim("\"");
				UIManager.setValue(_this.formHandler.wordAddingFormTranslationInput, translation);
				UIManager.setHTML(_this.formHandler.wordAddingFormSpecifiedTranslation, translation);

				UIManager.setFocus(_this.formHandler.wordAddingFormTranslationInput);

				_this.formHandler.hideLoadingAnimation();
			});
		});
		
	};

	this.addWord = function()
	{
		if (selectedText.length > 0)
		{
			var translation = UIManager.getValue(_this.formHandler.wordAddingFormTranslationInput);

			if (translation.length > 0)
			{
				Register.wordsManager.AddWord(selectedText, translation, null,
				function ()
				{
					Register.translationsHighlighter.showHighlights();
					UIManager.addClassToEl(_this.formHandler.form, "TR-Successful");

					setTimeout(function ()
					{
						_this.hideNewWordAddingForm();
						UIManager.removeClassFromEl(_this.formHandler.form, "TR-Successful");
					}, 50);
				});
			}
		}
	};
};

EventsManager.subscribe(Events.htmlChanged, function(el) 
{
	performOnElsList(el.querySelectorAll("[data-src]"), function(el) 
	{
		UIManager.setElAttr(el, "src", UIManager.getElData(el, "src"));
	});
});