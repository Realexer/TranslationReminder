var OptionsManager = function ()
{
	this.SitesInitialValues = "";

	this.GetSitesBlackListTextArea = function () { return document.getElementById("TR-SitesBlackList"); };
	this.GetSavingStatusLabel = function () { return document.getElementById("TR-SavingLabel"); };
	this.GetEnableAutoTranslateCheckbox = function () { return document.getElementById("TR-EnableAutoTranslate"); };
	this.GetLanguageSelect = function () { return document.getElementById("TR-TranslationLanguage"); };

	this.InitSettingsControls = function ()
	{
		this.InitGeneralSettingsControls();
		this.InitTranslationSettingsControls();
	};


	this.InitGeneralSettingsControls = function ()
	{
		var optionsManagerInstance = this;

		new DB().GetSitesBlackList(function (sites)
		{
			optionsManagerInstance.SitesInitialValues = optionsManagerInstance.GetSitesBlackListTextArea().value = sites.join(";");
		});

		optionsManagerInstance.GetSitesBlackListTextArea().oninput = function ()
		{
			if (optionsManagerInstance.GetSitesBlackListTextArea().value != optionsManagerInstance.SitesInitialValues)
			{
				optionsManagerInstance.TellNotSaved();
			}
			else
			{
				optionsManagerInstance.TellNothingToSave();
			}
		};
	};

	this.InitTranslationSettingsControls = function ()
	{
		var optionsManagerInstance = this;

		new DB().IsAutotranslationEnabled(function (result)
		{
			optionsManagerInstance.GetEnableAutoTranslateCheckbox().checked = result;
		});

		optionsManagerInstance.GetEnableAutoTranslateCheckbox().onchange = function ()
		{
			if (optionsManagerInstance.GetEnableAutoTranslateCheckbox().checked)
			{
				new DB().EnableAutoTranslation(function () { optionsManagerInstance.TellSaved(); });
			}
			else
			{
				new DB().DisableAutoTranslation(function () { optionsManagerInstance.TellSaved(); });
			}
		};


		new BingClient().GetSupportedLangs(function (langs)
		{
			langs.sort();
			for (var i = 0; i < langs.length; i++)
			{
				var option = document.createElement("option");
				option.setAttribute("value", langs[i]);
				option.innerHTML = langs[i];
				optionsManagerInstance.GetLanguageSelect().appendChild(option);
			}
		});
	};

	this.TellSaved = function ()
	{
		var optionsManagerInstance = this;

		optionsManagerInstance.GetSavingStatusLabel().className = "TR-Green";
		setTimeout(function ()
		{
			optionsManagerInstance.GetSavingStatusLabel().style.display = "block";
			optionsManagerInstance.GetSavingStatusLabel().innerHTML = "Saved";
			optionsManagerInstance.GetSavingStatusLabel().className = "TR-Green TR-Saved";
		}, 1);

	};

	this.TellNotSaved = function ()
	{
		this.GetSavingStatusLabel().style.display = "block";
		this.GetSavingStatusLabel().className = "TR-Red";
		this.GetSavingStatusLabel().innerHTML = "Not saved";
	};

	this.TellNothingToSave = function ()
	{
		this.GetSavingStatusLabel().style.display = "none";
	};
};

var optionsManager = new OptionsManager();

window.onload = function ()
{
	optionsManager.InitSettingsControls();
};

window.onkeydown = function ()
{
	if (event.keyCode === 13 && event.ctrlKey) // enter
	{
		new DB().UpdateSitesBlackList(optionsManager.GetSitesBlackListTextArea().value.split(";"), function ()
		{
			optionsManager.InitGeneralSettingsControls();
			optionsManager.TellSaved();
		});
	}
};