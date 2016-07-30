var TranslationsHighlighter = function(htmlHandler) 
{
	var _this = this;
	
	var htmlHandlder = htmlHandler;
	
	var textsHits = {};
	
	this.settings = null;
	
	this.init = function(callback) 
	{
		Register.settingsManager.getSettings(function(settings) {
			_this.settings = settings;
			
			if(callback) {
				callback();
			}
		});
	};
	
	this.showHighlightsOnDocuemnt = function() 
	{
		this.showHighlightsOnTextNodes(this.getTextNodes(document.body));
	};
	
	this.showHighlightsOnTextNodes = function(textNodes) 
	{
		Register.translationsManager.GetTranslations(function(translations) 
		{
			_this.showTranslationsHighlightsOnTextNodes(textNodes, translations);
		}, {
			condition: {
				learned: false
			}
		});
	};
	
	this.showTranslationsHighlights = function(el, translations)
	{
		this.showTranslationsHighlightsOnTextNodes(this.getTextNodes(el), translations);
	};
	
	this.showTranslationsHighlightsOnTextNodes = function(textNodes, translations) 
	{
		textsHits = {};
		
		performOnElsList(textNodes, function(textNode) {
			_this.highlightTextsInNode(textNode, translations, _this.settings[SettingsKeys.HighlightStyling]);
		});

		performOnEveryKey(textsHits, function(text, hits) {
			Register.translationsManager.SetTranslationHitsCount(text, hits, function() {
				console.log("Text hit counts updated");
			});
		});

		performOnElsList(document.querySelectorAll(".TR-HighlightedText"), function(highlightedText) {
			UIManager.addEventNoDefault(highlightedText, "click", function(event) {
				var translationDetails = highlightedText.querySelector(".TR-Hint");
				if(translationDetails != null) 
				{
					UIManager.removeEl(translationDetails);
				} else {
					showTranslationDetails(highlightedText, event);
				}
			});
		});
	};
	
	this.highlightTextsInNode = function(textNode, translations, styling)
	{
		try
		{
			var textHandler = textNode.parentNode;
			if (textHandler)
			{
				var modifiedText = textNode.textContent;

				if (textHandler.hasInParents("TR-NewWordForm") ||
					textHandler.hasInParents("TR-HighlightedText"))
				{
					return;
				}


				performOnElsList(translations, function(translationItem) 
				{
					// split by trtags in order to prevent replacing content insdie of trtags
					var modifiedTextSplit = modifiedText.split(new RegExp("(<trtag[^<]*</trtag>)", "mgi"));
					
					performOnElsList(modifiedTextSplit, function(splitPart, i) 
					{
						if(splitPart.search("<trtag") === -1) 
						{
							if (isHTMLContainsText(splitPart, translationItem))
							{
								modifiedTextSplit[i] = replaceTextWithHightlights(splitPart, translationItem, styling);
							}
						}
					});

					modifiedText = modifiedTextSplit.join("");
				});

				if (textNode.textContent != modifiedText) // changes were made
				{
					UIManager.addNodeFromHTML(textHandler, 
						Register.templater.formatTemplate("TranslationsHighlightsHandler", {content: modifiedText}), 
						false, textNode);
					UIManager.removeEl(textNode);	
				}
			}
		}
		catch (error)
		{
			console.log(error);
		}
	};

	this.getTextNodes = function(node) 
	{
		return findTextNodes(node);
	};

	function findTextNodes(node, textNodes)
	{
		if(textNodes === undefined) {
			textNodes = [];
		}
		
		performOnElsList(node.childNodes, function(node) 
		{
			if (node.nodeType === 3 // 3 - is text node
			&& _this.settings[SettingsKeys.RestrictedTags].concat(AppConfig.restrictedTags).indexOf(node.parentNode.tagName.toLowerCase()) === -1) 
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

	function isHTMLContainsText(textContent, translationItem)
	{
		return (textContent.search(new RegExp("\\b" + translationItem.text + "\\b", "mgi")) !== -1);
	};

	function replaceTextWithHightlights(textContent, translationItem, styling)
	{
		textContent = textContent.replace(new RegExp("\\b" + translationItem.text + "\\b", "mgi"), 
		function (match, offset, string)
		{
			translationItem.originalText = match;
			translationItem.styling = styling;
			translationItem.styling.backgroundColorFormatted = translationItem.styling.addBackgroundColor ? "background-color: "+translationItem.styling.backgroundColor : "";
			
			
			return Register.templater.formatTemplate("TranslationHighlight", translationItem).replaceAll("\"", "'").trim();
		});

		increaseTextHitsCount(translationItem);

		return textContent;
	};

	function increaseTextHitsCount(translationItem)
	{
		if (!textsHits[translationItem.text])
		{
			textsHits[translationItem.text] = parseInt(translationItem.hits) + 1;
		}
		else
		{
			textsHits[translationItem.text] += 1;
		}
	};


	function showTranslationDetails(hint, event)
	{
		var highlight = event.target;
		if (!UIManager.hasClass(highlight, "TR-HighlightedText"))
			return false;

		if (event.target.hasInChildren("TR-Hint")) // hint already displaied
			return false;

		var details = UIManager.addNodeFromHTML(hint, Register.templater.formatTemplate("TranslationDetails", 
		{
			text: UIManager.getElData(highlight, "tr-text"),
			translation: UIManager.getElData(highlight, "tr-translation"),
			image: UIManager.getElData(highlight, "tr-image"),
			definition: UIManager.getElData(highlight, "tr-definition"),
			hits: UIManager.getElData(highlight, "tr-hits"),
			date: parseInt(UIManager.getElData(highlight, "tr-date"))
		}));

		var highlightedTextElementRect = highlight.getBoundingClientRect();
		var hintRect = details.getBoundingClientRect();
		details.style.left = (highlightedTextElementRect.width / 2) + "px";
		details.style.top = (highlightedTextElementRect.height) + "px";

		UIManager.addEvent(details.querySelector("._tr_markAsLearnedButton"), "click", function(event, el) {
			markTextAsLearned(UIManager.getElData(el, "tr-text"));
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


	function markTextAsLearned(text)
	{
		Register.translationsManager.setTextLearned(text, 
		function ()
		{
			_this.removeHighLights(text);
			_this.showHighlightsOnDocuemnt();
			_this.hideAllTranslationDetails();
		});
	};

	

	
	/**
	 * If text is null all highlights will be removed
	 * 
	 * @param {type} text
	 * @returns {undefined}
	 */
	this.removeHighLights = function (text)
	{
		performOnElsList(document.querySelectorAll(".TR-HighlightedText"), function(highlightEl) 
		{
			if (text == null || UIManager.getHTML(highlightEl).trim().toLowerCase() == text.toLowerCase())
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
	
	this.removeAllHighlights = function() 
	{
		this.removeHighLights(null);
	};
};