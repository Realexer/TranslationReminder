var Config = new function ()
{
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
			successful: "TR-Successful"
		},
		newWordForm: {
			form: "TR-NewWordForm",
			title: "TR-NewWordForm-TitleHandler",
			titleText: "TR-NewWordForm-Title",
			formBody: "TR-NewWordForm-Body",
			selectedText: "TR-NewWordForm-CurrentSelection",
			specifiedTranslation: "TR-NewWordForm-SpecifiedTranslation",
			translationInput: "TR-NewWordForm-Translation",
			closeButton: "TR-NewWordForm-CloseButton"
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
			translationInput: "TR-NewWordForm-Translation"
		},
		hint: {
			handler: "TR-Hint",
			deleteWord: "TR-Hint-DeleteWordButton"
		}
	};

	this.BingIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQBt1A921hB21x9/2SB/2S+I3D+R3kCS30+a4VCb4WCk5HCt5/+mFf+8T//Me4C26o+/7JC/7J/I7qDJ77DS8v/Siv/YmP/dp//jtcDb9NDk99/s+f/oxP/u0+/1/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzKFFIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My4zNqnn4iUAAACHSURBVChTjY/NEoIwDIQXKBaoWEXjXyX7/m9p0vEgntyZ5PBNdrsFfwQgbtCf4JnHGMf8cK9ZQrBVFc4VAM2xkGXpgKmCXrmKrNQeyA4Kb3vTlQq0DsjZwUzuPMgvxMHBL6rJMl4id3IAEjgB3aKk+iuRFnCqQY1Nm62Ht7ukaEpW6wO+v/sGO2ESLp22P5MAAAAASUVORK5CYII=";

	this.restrictedTags = ["style", "script", "object", "embed", "textarea"];

};