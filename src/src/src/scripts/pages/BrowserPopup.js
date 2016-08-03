var BrowserPopup = function ()
{
	var _this = this;
	
	var switchHighlightingCheckbox = getEl("SwitchHilightingCheckbox");

	this.Init = function ()
	{
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) 
		{
			var currentTab = tabs[0];
			console.log(currentTab);
			
			Messanger.sendMessageToTab(currentTab.id, Messages.FE.GetDomain, null, function(domain) 
			{
				Register.settingsManager.isSiteBlacklisted(domain, function(isBlacklisted) {
					UIManager.setChecked(switchHighlightingCheckbox, !isBlacklisted);
				});
				
				UIManager.addEventNoDefault(switchHighlightingCheckbox, "change", function (e, el)
				{
					if(UIManager.isChecked(switchHighlightingCheckbox)) 
					{
						Register.settingsManager.RemoveSiteToBlackList(domain, function() {
							Messanger.sendMessageToTab(currentTab.id, Messages.FE.ShowHighlights, null, function() {
								
							});
						});
					}
					else 
					{
						Register.settingsManager.AddSiteToBlackList(domain, function() {
							Messanger.sendMessageToTab(currentTab.id, Messages.FE.RemoveHighlights, null, function() {
								
							});
						});
					}
				});
				
			});
		});
	};
};

window.onload = function ()
{
	var browserPopup = new BrowserPopup();
	browserPopup.Init();
};