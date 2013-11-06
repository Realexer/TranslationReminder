var OptionsManager = function ()
{
	this.SitesInitialValues = "";

	this.GetSitesBlackListTextArea = function ()
	{
		return document.getElementById("TR-SitesBlackList");
	};

	this.GetSavingStatusLabel = function ()
	{
		return document.getElementById("TR-SavingLabel");
	};

	this.InitSitesBlackListTextarea = function ()
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
				optionsManagerInstance.GetSavingStatusLabel().style.display = "block";
				optionsManagerInstance.GetSavingStatusLabel().className = "TR-Red";
				optionsManagerInstance.GetSavingStatusLabel().innerHTML = "Not saved";
			}
			else
			{
				optionsManagerInstance.GetSavingStatusLabel().style.display = "none";
			}
		};
	};
};

var optionsManager = new OptionsManager();

window.onload = function ()
{
	optionsManager.InitSitesBlackListTextarea();
};

window.onkeydown = function ()
{
	if (event.keyCode === 13 && event.ctrlKey) // enter
	{
		new DB().UpdateSitesBlackList(optionsManager.GetSitesBlackListTextArea().value.split(";"), function () 
		{
			optionsManager.InitSitesBlackListTextarea();
			optionsManager.GetSavingStatusLabel().style.display = "block";
			optionsManager.GetSavingStatusLabel().className = "TR-Green TR-Saved";
			optionsManager.GetSavingStatusLabel().innerHTML = "Saved";
		});	
	}
};