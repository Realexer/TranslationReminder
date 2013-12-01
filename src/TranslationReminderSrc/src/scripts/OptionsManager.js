var OptionsManager = function ()
{
	var sitesInitialValues = "";

	var sitesBlackListTextArea = document.getElementById("TR-SitesBlackList");
	var enableAutoTranslateCheckbox = document.getElementById("TR-EnableAutoTranslate");
	var languageSelect = document.getElementById("TR-TranslationLanguage");
	var savingStatusLabel = document.getElementById("TR-SavingLabel");

	this.Init = function ()
	{
		initGeneralSettingsControls();
		initTranslationSettingsControls();
	};


	function initGeneralSettingsControls()
	{
		sitesBlackListTextArea.onkeydown = function ()
		{
			if (event.keyCode === 13 && event.ctrlKey) // enter
			{
				new DB().UpdateSitesBlackList(sitesBlackListTextArea.value.split(";"), function ()
				{
					initGeneralSettingsControls();
					tellSaved();
				});
			}
		};

		new DB().GetSitesBlackList(function (sites)
		{
			sitesInitialValues = sitesBlackListTextArea.value = sites.join(";");
		});

		sitesBlackListTextArea.oninput = function ()
		{
			if (sitesBlackListTextArea.value != sitesInitialValues)
			{
				tellNotSaved();
			}
			else
			{
				tellNothingToSave();
			}
		};
	};

	function initTranslationSettingsControls()
	{
		new DB().IsAutotranslationEnabled(function (result)
		{
			enableAutoTranslateCheckbox.checked = result;
		});

		enableAutoTranslateCheckbox.onchange = function ()
		{
			if (enableAutoTranslateCheckbox.checked)
			{
				new DB().EnableAutoTranslation(function () { tellSaved(); });
			}
			else
			{
				new DB().DisableAutoTranslation(function () { tellSaved(); });
			}
		};

		languageSelect.onchange = function ()
		{
			new DB().SetTranslationLanguage(languageSelect.value, function () { tellSaved(); });
		};

		new BingClient().GetSupportedLangs(function (langs)
		{
			new DB().GetTranslationLanguage(function (lang)
			{
				langs.sort();
				for (var i = 0; i < langs.length; i++)
				{
					var option = document.createElement("option");
					option.setAttribute("value", langs[i]);
					option.selected = lang == langs[i];
					option.innerHTML = langs[i];
					languageSelect.appendChild(option);
				}
			});
		});
	};

	function tellSaved()
	{
		savingStatusLabel.className = "TR-Green";
		// hack for making animation run again. We first (re) apply not animated class and then run animated (again)
		setTimeout(function ()
		{
			savingStatusLabel.style.display = "block";
			savingStatusLabel.innerHTML = "Saved";
			savingStatusLabel.className = "TR-Green TR-Saved";
		}, 1);

	};

	function tellNotSaved()
	{
		savingStatusLabel.style.display = "block";
		savingStatusLabel.className = "TR-Red";
		savingStatusLabel.innerHTML = "Not saved";
	};

	function tellNothingToSave()
	{
		savingStatusLabel.style.display = "none";
	};
};

window.onload = function ()
{
	var optionsManager = new OptionsManager();
	optionsManager.Init();
};