opera.extension.onmessage = function(event) 
{
   // Get content of incoming message.
   var message = event.data.message;
   var data = event.data.data;

   switch (message)
   {
      case "loaded":
	 window.addEventListener("DOMContentLoaded", function()
	 {
	    document.onmouseup = selectWord;
	    refreshPage();
	 }, false);
	 break;

      case "no_user":
	 alert("First Log In or create New ID");
	 break;

      case  "writed":
	 Frontend.refreshPage();
	 break;

      case  "readed_on_page":
	 Frontend.refreshCallback((data));
	 break;

      case  "readed_on_table":
	 Frontend.reloadTableCallback((data));
	 break;

      case  "deleted":
	 Frontend.removeHighLights(data);
	 Frontend.refreshPage();
	 break;

      case "begin_synchronize":
	 opera.extension.postMessage({action: "synchronize", words: event.data.words});
	 break;

      case "synchronized":
	 Frontend.dataSynchronized(data);
	 Frontend.refreshPage();
	 break;

      case "logined":
	 Frontend.backToMain();
	 Frontend.synchonizeData();
	 break;

      case "login_failed":
	 alert("Cound not login. UserId does not exists");
	 document.getElementById("_loading_view").style.display = "none";
	 break;

      case "acc_created":
	 Frontend.backToMain();
	 Frontend.synchonizeData();
	 break;

      case "acc_created_failed":
	 alert("Cound not create account. Try another");
	 document.getElementById("_loading_view").style.display = "none";
	 break;

      case "show_username":
	 showUserName(data);
	 Frontend.break;

      case "paste_username":
	 Frontend.pasteUserName(data);
	 break;
   }
};


// on load function for testing out of widget
/*window.addEventListener("DOMContentLoaded", function()
{
   document.onmouseup = selectWord;
   //document.body.onclick = showWordsTable();
   refreshPage();

   var displayer = document.createElement("div");
   displayer.appendChild(document.createTextNode("SHOW"));
   displayer.style.position = "fixed";
   displayer.style.display = "table";
   displayer.style.background = "#aaa";
   displayer.style.left = "0px";
   displayer.style.top = "0px";


   document.body.appendChild(displayer);
   displayer.onclick = showWordsTable;

}, false);*/



