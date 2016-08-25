var BrowserPopup = function ()
{
	var _this = this;
	
	var popupBody = getEl("TR-Popup-Body");

	this.Init = function ()
	{
		TemplatesLoader.initTemplater();
		
		var options = "";
		
		performOnElsList(LangsMapper.getLangKeys2(), function(key) {
			options += Register.templater.formatTemplate("LanguageOption", {
				lang: key
			});
		});
		
		UIManager.setNodeFromHTML(popupBody, Register.templater.formatTemplate("BrowserPopupBody", {
			langOptions: options
		}));
		
		var switchHighlightingCheckbox = popupBody.querySelector(".SwitchHilightingCheckbox");
		var replaceHighlightsWithTranslationsCheckbox = popupBody.querySelector(".ReplaceHighlightsWithTranslationsCheckbox");
		var siteLanguageSelect = popupBody.querySelector(".SiteLanguageSelect");
		
		
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) 
		{
			var currentTab = tabs[0];
			console.log(currentTab);
			
			Messanger.sendMessageToTab(currentTab.id, Messages.FE.GetSiteInfo, null, function(siteInfo) 
			{
				UIManager.setValue(siteLanguageSelect, siteInfo.lang);
				
				UIManager.addEvent(siteLanguageSelect, "change", function() {
					// save lang to settings for permanent use
					Register.settingsManager.SetSiteLanguage(siteInfo.domain, UIManager.getValue(siteLanguageSelect), function() {
						
					});
				});
				
				Register.settingsManager.isSiteBlacklisted(siteInfo.domain, function(isBlacklisted) {
					UIManager.setChecked(switchHighlightingCheckbox, !isBlacklisted);
				});
				
				UIManager.addEventNoDefault(switchHighlightingCheckbox, "change", function (e, el)
				{
					if(UIManager.isChecked(switchHighlightingCheckbox)) 
					{
						Register.settingsManager.RemoveSiteToBlackList(siteInfo.domain, function() {
							Messanger.sendMessageToTab(currentTab.id, Messages.FE.ShowHighlights, null, function() {
								
							});
						});
					}
					else 
					{
						Register.settingsManager.AddSiteToBlackList(siteInfo.domain, function() {
							Messanger.sendMessageToTab(currentTab.id, Messages.FE.RemoveHighlights, null, function() {
								
							});
						});
					}
				});
				
				UIManager.setChecked(replaceHighlightsWithTranslationsCheckbox, siteInfo.isReplacedWithTranslations);
				
				UIManager.addEventNoDefault(replaceHighlightsWithTranslationsCheckbox, "change", function() 
				{
					var message = UIManager.isChecked(replaceHighlightsWithTranslationsCheckbox) 
									? Messages.FE.ReplaceHighlightsWithTranslations 
									: Messages.FE.ReplaceHighlightsWithOriginalText;
					
					Messanger.sendMessageToTab(currentTab.id, message, null, function() {

					});
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