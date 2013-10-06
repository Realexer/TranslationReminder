var Frontend = function ()
{
	this.classNames =
	{
		highlightedClass: "translation_reminder_",
		hintClassName: "translation_reminder_hint_",
		newWordFormID: "_translation_reminder_new_word_form",
		wordsHandler: "your_meaning_words_handler"
	};

	this.currentSelection = null;

	this.textNodes = new Array();
	this.textNodesValues = new Array();
	this.globalWords = new Array();

	var oNewNode;


	this.RefreshPage = function ()
	{
		this.FindTexts(document.body);

		// TODO opera.extension.postMessage({ action: "get", backMessage: "readed_on_page" });
	};

	this.RefreshCallback = function (words)
	{
		this.globalWords = words;

		for (var i = 0; i < this.textNodes.length; i++)
		{
			this.FindWordsOnThePage(this.textNodes[i], this.textNodesValues[i]);
		}

		this.ReloadWordsTable();
	};


	this.FindTexts = function (node)
	{
		for (var i = 0; i < node.childNodes.length; i++)
		{
			var childNode = node.childNodes[i];

			if (childNode.id === this.classNames.wordsHandler)
				continue;
			if (childNode.id === this._YM_newWordFormID)
				continue;

			// if text node
			if (childNode.nodeType === 3)
			{
				var nodeValue = childNode.nodeValue.fullTrim();
				if (nodeValue !== undefined && nodeValue.length > 0)
				{
					// add to array
					this.textNodesValues.push(nodeValue);
					this.textNodes.push(childNode);
				}
			}
			else
			{
				this.FindTexts(childNode);
			}
		}
	};


	this.FindWordsOnThePage = function (node, nodeTextOrigin)
	{
		var nodeText = new String(nodeTextOrigin);

		for (var i = 0; i < this.globalWords.length; i++)
		{
			var word = this.globalWords[i].word;
			var meaning = this.globalWords[i].meaning;
			if (word.length > 0)
			{
				var pos = null;
				try
				{
					pos = nodeText.toLowerCase().search(new RegExp(word.toLowerCase(), 'mg'));
				}
				catch (error)
				{
					continue;
				}

				if (pos !== -1)
				{
					var leftPart = nodeText.substr(0, pos);
					var rightPart = nodeText.substr(pos + word.length, nodeText.length);
					var middlePart = nodeText.substr(pos, parseInt(word.length, 10));

					var leftElement = null, rightElement = null;

					if (leftPart.length === 0 && rightPart.length === 0)
					{
						if (node.parentNode)
						{
							if (node.parentNode.getAttribute("class") === this.highlightedClass)
							{
								continue;
							}
						}
					}

					var newElement = document.createElement("span");
					if (leftPart.length > 0)
					{
						leftElement = document.createTextNode(leftPart);
						newElement.appendChild(leftElement);
					}

					var updatedElement = document.createElement("a");

					updatedElement.setAttribute("title", meaning);

					updatedElement.setAttribute("class", this.highlightedClass);
					updatedElement.addEventListener("click", ShowHint, true);


					updatedElement.style.backgroundColor = "#cef";
					updatedElement.style.position = "relative";
					updatedElement.appendChild(document.createTextNode(middlePart));
					newElement.appendChild(updatedElement);

					if (rightPart.length > 0)
					{
						rightElement = document.createTextNode(rightPart);
						newElement.appendChild(rightElement);
					}

					if (node.parentNode)
					{
						node.parentNode.replaceChild(newElement, node);
					}

					if (leftPart.length > 0)
					{
						this.FindWordsOnThePage(leftElement, leftPart);
					}

					if (rightPart.length > 0)
					{
						this.FindWordsOnThePage(rightElement, rightPart);
					}
				}
			}
		}
	};

	this.RemoveHighLights = function (word)
	{
		var highlightedElms = getElementsByClassName(document.body, "a", this.highlightedClass);

		for (var i = 0; i < highlightedElms.length; i++)
		{
			var curElem = highlightedElms[i];

			if (curElem.firstChild.nodeValue.toLowerCase() == word.toLowerCase())
			{
				var parentElem = curElem.parentNode;

				if (parentElem != undefined)
				{
					var textNode = document.createTextNode(curElem.firstChild.nodeValue);
					parentElem.replaceChild(textNode, curElem);
				}
			}
		}
	};


	this.SelectWord = function (event, frontend)
	{
		if (event.target.id === "insertButton"
	      || event.target.id === "insertButtonValue"
	      || event.target.id === "insertButtonItem"
	      || event.target.id === "current_selection"
	      || event.target.id === "insertButtonTitle"
	      || event.target.id === "insertButtonClose"
	      || event.target.id === "insertButtonTitleHandler"
	      || event.target.id === "insertButtonSubItem"
	      || event.target.id === "_tranlsate_with_bing")
			return;

		if (!event.ctrlKey)
		{
			this.HideNewWordAddingForm();
			this.currentSelection = null;
			return;
		}


		var selection = window.getSelection();
		this.currentSelection = selection.toString();
		this.CreateWordAddingForm();

		if (this.currentSelection.length === 0)
		{
			this.HideNewWordAddingForm();
			this.currentSelection = null;
			return;
		}
		else
		{
			this.ShowNewWordAddingForm();
		}

		var range = selection.getRangeAt(0);

		range.collapse(false);
		var offset = range.getBoundingClientRect();
		var probTop = offset.top - this.WordAddingForm().clientHeight + window.pageYOffset;
		var probLeft = offset.left;


		if (probTop < 0)
		{
			this.WordAddingForm().style.top = offset.bottom + window.pageYOffset + "px";
		}
		else
		{
			this.WordAddingForm().style.top = probTop + "px";
		}

		if (parseInt(probLeft + parseInt(this.WordAddingForm().clientWidth)) > parseInt(window.outerWidth))
		{
			var scrollWidth = 20;
			this.WordAddingForm().style.left = (parseInt(window.outerWidth) - parseInt(this.WordAddingForm().clientWidth)) - scrollWidth + "px";
		}
		else
		{
			this.WordAddingForm().style.left = probLeft + "px";
		}

		document.getElementById("insertButtonValue").focus();
	};

	this.ShowNewWordAddingForm = function ()
	{
		this.WordAddingForm().style.display = "table";
		var meaningInput = document.getElementById("insertButtonValue");
		meaningInput.value = "";
		var word = document.getElementById("current_selection");
		word.firstChild.nodeValue = this.currentSelection;
	};

	this.HideNewWordAddingForm = function ()
	{
		if (this.WordAddingForm())
		{
			this.WordAddingForm().style.display = "none";
			var word = document.getElementById("current_selection");
			word.firstChild.nodeValue = "";
		}
	};

	this.WordAddingForm = function ()
	{
		return document.getElementById('insertButton');
	};

	this.CreateWordAddingForm = function ()
	{
		if (!oNewNode)
		{
			oNewNode = document.createElement("div");
			var bingImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQBt1A921hB21x9/2SB/2S+I3D+R3kCS30+a4VCb4WCk5HCt5/+mFf+8T//Me4C26o+/7JC/7J/I7qDJ77DS8v/Siv/YmP/dp//jtcDb9NDk99/s+f/oxP/u0+/1/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzKFFIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My4zNqnn4iUAAACHSURBVChTjY/NEoIwDIQXKBaoWEXjXyX7/m9p0vEgntyZ5PBNdrsFfwQgbtCf4JnHGMf8cK9ZQrBVFc4VAM2xkGXpgKmCXrmKrNQeyA4Kb3vTlQq0DsjZwUzuPMgvxMHBL6rJMl4id3IAEjgB3aKk+iuRFnCqQY1Nm62Ht7ukaEpW6wO+v/sGO2ESLp22P5MAAAAASUVORK5CYII%3D";
			oNewNode.innerHTML =
		 "<style type=\"text/css\"> .nwf_handler {background:#fff;z-index:2147483647; display: none;position: absolute; width: 250px;border: 1px solid #aaf;font-family: Arial;font-size: 17px;overflow: hidden; } " +
		 " .nwf_handler div{display: block; } .nwf_handler * {text-align: left; } " +
		 " .nwf_handler span, input{display: inline; } .nwf_title {background: #aaf;font-weight: bold;font-size: 0.8em;color:#fff;padding: 2px 0px;padding-left: 0.2em;text-transform: uppercase; } " +
		 " .nwf_handler table{font-size:0.8em;width: 100%;border-collapse: collapse; } .nwf_word_table{height: 15px;overflow: hidden; } " +
		 " .nwf_selected_word {font-weight: bold;padding: 3px 4px; } .nwf_close_button{width: 25px; } " +
		 ".nwf_close_button{text-align: center;color: #c77;float:right;cursor: pointer; } " +
		 ".nwf_meaning_table{font-size:0.8em; height: 25px; } .nwf_input{padding-left: 4px; } .nwf_input input {width: 87%; border-bottom-color: rgb(170, 170, 170);border-bottom-left-radius: 2px;border-bottom-right-radius: 2px;border-bottom-style: solid;border-bottom-width: 1px;border-left-color: rgb(170, 170, 170);border-left-style: solid;border-left-width: 1px;border-right-color: rgb(170, 170, 170);border-right-style: solid;border-right-width: 1px;border-top-color: rgb(170, 170, 170);border-top-left-radius: 2px;border-top-right-radius: 2px;border-top-style: solid;border-top-width: 1px;box-sizing: border-box;}" +
		 " .nwf_add_button{font-size: 1.2em;width: 25px;cursor: pointer; } .nwf_add_button div{color: green;text-align: center;border: 1px solid #7a7;width: 21px; margin-bottom: 1px;} " +
		 " </style> " +
		 "<div class=\"nwf_handler\" id=\"insertButton\"> <div id='insertButtonTitleHandler' class=\"nwf_title\"><div style='float:left' id='insertButtonTitle'>Remember</div>" +
		 "<div class=\"nwf_close_button\" id=\"insertButtonClose\"> x</div> <div style=\"clear:both\"></div> </div> " +
		 "<table class=\"nwf_word_table\"><tr> <td class=\"nwf_selected_word\">" +
		 "<div id=\"current_selection\">word</div> </td><td width=\"20px\"><img id=\"_tranlsate_with_bing\" src=\"" + bingImageUrl + "\" alt=\"Tranlate with bing\" /></td></tr> </table> <table class=\"nwf_meaning_table\">" +
		 "<tr> <td class=\"nwf_input\"><b style='color:rgb(39, 150, 65);'>AS</b> <input value=\"\" type=\"text\" id=\"insertButtonValue\"/> </td>" +
		 " <td class=\"nwf_add_button\" id=\"insertButtonItem\"><div id=\"insertButtonSubItem\">+</div> </td></tr> </table></div>";
		}

		if (!this.WordAddingForm())
		{
			oNewNode.id = this._YM_newWordFormID;
			document.body.appendChild(oNewNode);
			document.getElementById("insertButtonItem").onclick = this.AddWord;
			document.getElementById("_tranlsate_with_bing").onclick = this.TranslateWithBing;

			var frontendInstance = this;
			document.getElementById("insertButtonValue").onkeypress = function (event)
			{
				if (event.keyCode === 13) // enter pressed
				{
					frontendInstance.AddWord();
				}
			}

			document.getElementById("insertButtonClose").onclick = this.HideNewWordAddingForm;
		}
	};

	this.AddWord = function ()
	{
		if (this.currentSelection.length > 0)
		{
			this.HideNewWordAddingForm();
			var meaningInput = document.getElementById("insertButtonValue");
			var meaning = meaningInput.value;

			if (meaning.fullTrim().length > 0)
			{
				// TODO: opera.extension.postMessage({ action: "write", word: this.currentSelection, meaning: meaning });
				this.writeWord(currentSelection, meaning, function ()
				{
					RefreshPage();
				});
			}
		}
	};


	this.TranslateWithBing = function ()
	{
		if (this.currentSelection.length > 0)
		{
			window.mycallback = function (response)
			{
				var meaningInput = document.getElementById("insertButtonValue");
				meaningInput.value = response;
			}

			var s = document.createElement("script");
			s.src = "http://api.microsofttranslator.com/V2/Ajax.svc/Translate?oncomplete=bingcallback&appId=8E54095330F0B7E7CB73527A50437E6110A64730&to=" + "ru" + "&text=" + this.currentSelection;
			if (document.getElementsByTagName("head") && document.getElementsByTagName("head")[0])
			{
				document.getElementsByTagName("head")[0].appendChild(s);
			}
			else
			{
				document.appendChild(s);
			}
		}
	};


	this.ShowHint = function (event)
	{
		var curTarget = event.target;
		if (curTarget.className !== this.highlightedClass)
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
		//hint.innerHTML = "" + curTarget.getAttribute("title") + " &nbsp; &nbsp; <span id='deleteWordSpan' onClick='//deleteWord(\"" + curTarget.firstChild.nodeValue + "\");'>X</span>";
		hint.setAttribute("class", this.hintClassName);
		//hint.style.display = "table";
		hint.style.position = "absolute";
		hint.style.bottom = "1.3em";
		hint.style.right = "0em";
		hint.style.fontSize = "1em";
		hint.style.zIndex = 100;
		hint.id = "_ym_hint_div";


		curTarget.appendChild(hint);

		var frntnd = this;

		hint.addEventListener("click", this.DeleteHint, false);
		document.getElementById('_ym_hint_table').addEventListener("click", this.DeleteHint, false);
		document.getElementsByTagName("body")[0].addEventListener("click", this.DeleteHint, false);

		document.getElementById('deleteWordSpan').onclick = function ()
		{
			frntnd.DeleteWord(curTarget.firstChild.nodeValue);
			// TODO: opera.extension.postMessage({ action: "delete", word: curTarget.firstChild.nodeValue });
			DeleteWord(curTarget.firstChild.nodeValue);
		};
	};

	this.DeleteHint = function (event)
	{
		if (event.target.className === this.highlightedClass)
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