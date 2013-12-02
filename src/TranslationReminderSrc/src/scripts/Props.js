var Props = new function ()
{
	this.defaults =
	{
		TranslationLanguage: "en"
	};

	this.classNames =
	{
		highlightedText: "TR-HighlightedText",
		common: {
			base: "TR-Base",
			green: "TR-Green",
			red: "TR-Red",
			clear: "TR-Clear",
			word: "TR-Word",
			translation: "TR-Translation",
			knowIt: "TR-KnowIt",
			wordData: "TR-WordData",
			successful: "TR-Successful",
			loadingAnimation: "TR-LoadingAnimation",
			bgDark: "TR-BG-Dark",
			bgLight: "TR-BG-Light"
		},
		newWordForm: {
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-TitleHandler",
			titleText: "TR-NewWordForm-Title",
			formBody: "TR-NewWordForm-Body",
			selectedText: "TR-NewWordForm-CurrentSelection",
			specifiedTranslation: "TR-NewWordForm-SpecifiedTranslation",
			translationInput: "TR-NewWordForm-Translation",
			closeButton: "TR-NewWordForm-CloseButton",
			buttonsPanel: "TR-NewWordForm-ButtonsPanel",
			bingButton: "TR-NewWordForm-BingButton",
			loadingAnimation: "TR-NewWordForm-LoadingAnimation"
		},
		hint: {
			handler: "TR-Hint",
			wordBaseInfo: "TR-WordBaseInfo",
			word: "TR-Hint-Word",
			translation: "TR-Hint-Translation",
			wordAdditionalInfo: "TR-WordAdditionalInfo",
			deleteWord: "TR-Hint-DeleteWordButton"
		}
	};

	this.IDs =
	{
		newWordForm:
		{
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-TitleHandler",
			titleText: "TR-NewWordForm-Title",
			closeButton: "TR-NewWordForm-CloseButton",
			selectedText: "TR-NewWordForm-CurrentSelection",
			specifiedTranslation: "TR-NewWordForm-SpecifiedTranslation",
			translationInput: "TR-NewWordForm-Translation",
			buttonsPanel: "TR-NewWordForm-ButtonsPanel",
			bingButton: "TR-NewWordForm-BingButton",
			loadingAnimation: "TR-NewWordForm-LoadingAnimation"
		},
		hint: {
			handler: "TR-Hint",
			deleteWord: "TR-Hint-DeleteWordButton"
		}
	};

	this.BingIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQBt1A921hB21x9/2SB/2S+I3D+R3kCS30+a4VCb4WCk5HCt5/+mFf+8T//Me4C26o+/7JC/7J/I7qDJ77DS8v/Siv/YmP/dp//jtcDb9NDk99/s+f/oxP/u0+/1/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzKFFIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My4zNqnn4iUAAACHSURBVChTjY/NEoIwDIQXKBaoWEXjXyX7/m9p0vEgntyZ5PBNdrsFfwQgbtCf4JnHGMf8cK9ZQrBVFc4VAM2xkGXpgKmCXrmKrNQeyA4Kb3vTlQq0DsjZwUzuPMgvxMHBL6rJMl4id3IAEjgB3aKk+iuRFnCqQY1Nm62Ht7ukaEpW6wO+v/sGO2ESLp22P5MAAAAASUVORK5CYII=";
	this.LoadingAnimationBase64 = "R0lGODlhHgAeAMQZAMbGxrW1tb29vaWlpZSUlK2trYSEhGtra3t7e4yMjJycnDExMVJSUmNjY3Nzc0pKSlpaWkJCQikpKSEhITk5ORgYGM7OztbW1t7e3v///wAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAAZACwAAAAAHgAeAAAF8GAmjmRpniiaGFjqiu2ITdP1phiEyMsCyJjYTRCJ/DKY3jEYvMEODEgr6YMxnSLAg6FAKpFXF+YSwyAYjOBi8gtbS5hGgwV7RAKYQ8NaZgqRCg16CS2BU4dAbjIADgeNFkg4fjgDBxAGYpM3A38mTZKKN35CAgYEpwkOAaKjnwMOBrEGDgOsrXyjWLkooZ66BQoCmZ+8AQQKBJCSZMQkF8gEBYd/V7ckGAoJCk0YAZxgSBcAfaEYFkIXA8IZAKvhQr1w3lPtU+edLxYF40gC/EFksCCZB6OelYBOMAw4B8MfvGYviI3BA0TgiXgWM44IAQAh+QQFAAAZACwBAAEAGwAbAAAFwGAmjuSoEGWqqlGEke9KOugIMdeILLmcWZBGLMN4WEaSicEnMhwctkcOA1lEmCLL4RAQMRjHgGShkA0zhK3XhYksHmeSgUZqNI4IBKZQkRxXAwgGCGUZAQgpDHo+FgkGjj0pGHErAHM1WExdmZydIxcKA6IKCX+eGQAJJwSkAqevsEyUKgAFkbAWAQEDtyuzGAEFBaawu64jAMcwszAwAX8XpswrF8oWACPTkgFDALfaJLkkF9jNWABn3rElGMoyIQAh+QQFAAAZACwBAAEAGwAcAAAFv2AmjuQIBGWqqhC0vmJSkMiBjQlzw5iDkAfHLhOJEGAihSExqu0ODBcyg0EYLqLgDfB4CKaigcEgcjREDcZ5ZCENCN8m4kZQZASUxxAyWewABHUAIoApDkxVC4p6IxhvCgRDKhYUihSRKY4JAzANFQsHVCsYWEgOApKZYBipGAACsAIFpWAkjgW4BQOptb2qvi+8JRiowMPEAcK1FwHJxrYCtBkXbc8lFqzZrMakjcpT1SLYz9uN4b6p49bD68YhACH5BAUAABkALAIAAQAbABoAAAWwYCaOpGhZZaqqDrK+4gCQhEEODTwmBGkkpAZEoMsECIVRbYRwOIoiggIj+okujQMKCpCKEs+M4eAaXUiAwlmpiCUtkAPp8GCYBwUBNYMZpAxtGQQPEA85aHgBOhgMdQx+KgAKMy8IFAxlL3swBptQnyMYAKMAFp4rBAsRFKsSCAICAQGwUA4TC7gLE2GgIqKysqa9w1vDKRfFxnwWa8ojwqHNzr7TJafOntfT2sbcKSEAIfkEBQAAGQAsAgABABsAFgAABbFgJo6kiF1lqqoJsb4igI6FOwIIPA4CSQwkhGMGwxQsO1tGYUjoRoGe6GdCIDBPU0GqcGYIBgUJOzqRRYOCSADIYBwGkqHhKFsExEy7pAigHQcHOSQXUXswgIGHJRgBZywQB2JZMECUlyUXmppZAwwNoA0RChYApgBITwYRDK0MEXGYdha0j5dGtiq5JQcTEQO7JnkqBBILEg/DbsGMFgwLCxMNYynMbgEREhPW1SoGUiEAIfkEBQAAGQAsAgABABsAGwAABbpgJo7kiJVomg6F6orXOQIDeRHvGFxkEZAEgiwXGApqIgEBmctYeCLfiKBokoqiQDUTIPxcw6xA9BQltiKCIUHCWMLhrCW5RuDaz3nOgDAYoCkAOQN9X1YuhoeKJhiNcSoBBwiTCA1FFxaZjykEEAefBxBMizAXMaRXqCkGFBCJKZskAw8MDw2xLxgHNbq0EQikAxMTIwINDxGoFBQNQICKBgsSeqoiGBELDLiHAhITaNUYEBOC1SYZjyEAIfkEBQAAGQAsAQACABwAHAAABbdgJo7kaFllqopYaQUkVqyp1Y4BQBYwXV4kQC/zEvhKmFtGoBMVZkfXCNN8NaMjADCTFCmgIoFikFLSLreLQkEAx7pHNkFhrh0BBMIVS0Px/4A0AAZ5eQhGXEl1NAUOBo8GDm6BiYuBW5QpChAOe5lLDQcNCJ8ZCE0GB6oJfwmkABQRIxcODRB/ExMtDBCkIwWWKxQLKAoPD5iBw00QDA2fEQtVDxFDgMsjDrKZCxOemRiqwYFwRyEAIfkEBQAAGQAsBwACABYAGwAABbFgJo4ZhpFoimIAaqklCpyj1cK0eN2lcMEpwE9kGQJzmSHGB9QhRQUBycZr5liBwauJyha2o2fqMmByVeKz+nxRDN4DgpELSCgIBEUCvO6T0moBDglzaxYIBggJKgAOTwQjBAaJA38UFYt6GRYQDWEJCA4kDgsUJxERIgcHizUoEguiGQ0PJwIHDWkYDAupIgwPQw4HCIwLEq2zwSIYDQ18RBIMOcBGCRBiYgwRhWuTaiEAIfkEBQAAGQAsAgADABsAGwAABbFgJo7kiJVnqa4W2q6w+YpXGsOWjdk3bNc91EpwIWGAwRtGECgmhwIB72kM5KjYrDaICUS/0ydmUCgXBuHtqpvGCiKTxk1AULQZkoUEcbsQ/gMlCHkLD1IWCSpoIgF1BAIiGHoUCSkQCwoZAYEYDnwjAwSJjJ8iCQ8QIg1yGQYJmSY3DAwGIggHNAilPQcMqSIHBykJBrB9Dw+BtsIjum0jFxG4I8E2A7tUDhDPVHVqaiEAIfkEBQAAGQAsAQAEABsAGgAABahgJo7kiJXZia6oKrpsDMc0O9fxNd/4ilm8XuZysQhpgOBxyRwhJJQoRYLoWSyALMYxWXgXE4dVEAiQMYByWddkXdqlSyNSlQ2MrMODEUnQMAUFAQAlCREMDw1GGAoohCIWA2ZvInwQA04MBRlpIgR+I5GYIgAEJAoHdQh1AwqPPQcHphkEBi8EszgGqSMGoBmtozUNDa+1p78yDba9yaVtCWJwJGXTTSEAIfkEBQAAGQAsAQAHABsAFgAABbFgJg6YaJ5oamKSxFzqWcYZdkiL1NDxLGKEyGI44NUwvpSBUmEYYUYMwkhdVVOKCKSxZSiqmIsYZogwzoyIoXoBuAGCjGVuASSvtDtehmgQjAJ6JgkNBw1FPHAWdwMHjggzBSlQNXUXPoYOACYEB5sXFiIFiD8BoSIXkiYCCH8ZCa4ABYIxBgYBI64ZBbhVCgYJnKQCAZtRCAinGQO6GcRVCKQZBNIXcXsiCsHYKhaUNCEAIfkEBQAAGQAsAQACABsAGwAABblgJo4ZRp5oSi6H6qbDNAFvLWLMQpn2CyyLRA9FuzWAQ9LjceBlJBVhMmN4MB4OUYIxHQUgDMgjUOqSCAxK6+V8EcxwV+CAqCMOhSFmbxpADoAHEG82exaHFyUXi21xji4KCAM1jSeRBghkLxcWlQAGoIQZFihtGBdtmAakIgUGiXsiAAInqCMYrCIXBJMZA70XtEkKBKwCvRkCuTUCBJoZBc/BlSkEBE7HJJw9CcKtzyXUNgHIj7E1IQA7";
	this.restrictedTags = ["style", "script", "object", "embed", "textarea"];

};