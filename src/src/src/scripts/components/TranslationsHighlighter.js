var TranslationsHighlighter = function() 
{
	var _this = this;
	
	var wordsHits = {};
	
	this.init = function() 
	{
		this.showHighlights();
	};
	
	this.showHighlights = function()
	{
		Register.settingsManager.ifSiteNotInBlackList(document.domain, function() 
		{
			var textNodes = findTextNodes(document.body);
			
			Register.wordsManager.GetWords(function(words) 
			{
				performOnElsList(textNodes, function(textNode) {
					_this.highlightTextsInNode(textNode, words);
				});

				performOnEveryKey(wordsHits, function(word, hits) {
					Register.wordsManager.UpdateWordHitCount(word, hits, function() {
						console.log("Word hit counts updated");
					});
				});

				performOnElsList(document.querySelectorAll(".TR-HighlightedText"), function(highlightedText) {
					UIManager.addEvent(highlightedText, "click", function(event) {
						showTranslationDetails(event);
					});
				});
			});
		});
	};
	
	this.highlightTextsInNode = function(textNode, words)
	{
		try
		{
			if (textNode.parentNode)
			{
				var resultInnerHTML = textNode.parentNode.innerHTML;

				if (textNode.parentNode.hasInParents("TR-NewWordForm") ||
					textNode.parentNode.hasInParents("TR-HighlightedText"))
				{
					return;
				}


				performOnElsList(words, function(wordItem) {
					// split by trtags in order to prevent replacing content insdie of trtags
					var resultInnerHTMLSplitted = resultInnerHTML.split(new RegExp("(<trtag[^<]*)", "mgi"));

					performOnElsList(resultInnerHTMLSplitted, function(splitPart, i) 
					{
						if (splitPart.search("<trtag"))
						{
							if (isHTMLContainsWord(splitPart, wordItem))
							{
								resultInnerHTMLSplitted[i] = replaceHTMLWithHightlightedTexts(splitPart, wordItem);
							}
						}
					});

					resultInnerHTML = resultInnerHTMLSplitted.join("");
				});

				if (textNode.parentNode.innerHTML != resultInnerHTML) // changes were made
				{
					textNode.parentNode.innerHTML = resultInnerHTML;
				}
			}
		}
		catch (error)
		{
			console.log(error);
		}
	};


	function findTextNodes(node, textNodes)
	{
		if(textNodes === undefined) {
			textNodes = [];
		}
		
		performOnElsList(node.childNodes, function(node) 
		{
			if (node.nodeType === 3 // 3 - is text node
			&& Props.restrictedTags.indexOf(node.parentNode.tagName.toLowerCase()) === -1) 
			{
				if(!UIFormat.isEmptyString(node.nodeValue)) 
				{
					textNodes.push(node);
				}
			}
			else
			{
				textNodes = findTextNodes(node, textNodes);
			}
		});
		
		return textNodes;
	};

	function isHTMLContainsWord(resultInnerHTML, wordItem)
	{
		return (resultInnerHTML.search(new RegExp("\\b" + wordItem.word + "\\b", "mgi")) !== -1);
	};

	function replaceHTMLWithHightlightedTexts(resultInnerHTML, wordItem)
	{
		resultInnerHTML = resultInnerHTML.replace(new RegExp("\\b" + wordItem.word + "\\b", "mgi"), 
		function (match, offset, string)
		{
			wordItem.original = match;
			return Register.templater.formatTemplate("TranslationHighlight", wordItem).replaceAll("\"", "'");
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


	function showTranslationDetails(event)
	{
		var highlightedTextElement = event.target;
		if (UIManager.getClass(highlightedTextElement) !== Props.classNames.highlightedText)
			return false;

		if (event.target.hasInChildren(Props.classNames.hint.handler)) // hint already displaied
			return false;

		var hint = UIManager.addNodeFromHTML(document.body, Register.templater.formatTemplate("TranslationDetails", 
		{
			word: UIManager.getElData(highlightedTextElement, "tr-word"),
			translation: UIManager.getElData(highlightedTextElement, "tr-translation"),
			hits: UIManager.getElData(highlightedTextElement, "tr-hits"),
			date: parseInt(UIManager.getElData(highlightedTextElement, "tr-date"))
		}));

		var highlightedTextElementRect = highlightedTextElement.getBoundingClientRect();
		var hintRect = hint.getBoundingClientRect();
		hint.style.left = (window.scrollX + highlightedTextElementRect.right - highlightedTextElementRect.width / 2) + "px";
		hint.style.top = (window.scrollY + highlightedTextElementRect.top - hintRect.height) + "px";

		UIManager.addEvent(hint.querySelector("._tr_markAsLearnedButton"), "click", function(event, el) {
			deleteWord(UIManager.getElData(el, "tr-word"));
		});
	};


	this.hideAllTranslationDetails = function()
	{
		performOnElsList(document.querySelectorAll(".TR-Hint"), function(el) {
			Threader.putInQueue(function() {
				UIManager.removeEl(el);
			});
		});
	};


	function deleteWord(word)
	{
		Register.wordsManager.DeleteWord(word, 
		function ()
		{
			_this.removeHighLights(word);
			_this.showHighlights();
			_this.hideAllTranslationDetails();
		});
	};

	

	
	/**
	 * If word is null all highlights will be removed
	 * 
	 * @param {type} word
	 * @returns {undefined}
	 */
	this.removeHighLights = function (word)
	{
		performOnElsList(document.querySelectorAll(".TR-HighlightedText"), function(highlightEl) 
		{
			if (word == null || UIManager.getHTML(highlightEl).trim().toLowerCase() == word.toLowerCase())
			{
				if (highlightEl.parentNode)
				{
					var textNode = document.createTextNode(UIManager.getHTML(highlightEl).trim());
					Threader.putInQueue(function() {
						highlightEl.parentNode.replaceChild(textNode, highlightEl);
					});
				}
			}
		});
	};
};