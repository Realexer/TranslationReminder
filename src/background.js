window.addEventListener("load", function() 
{   
   var UIItemProperties = {
      disabled: false, 
      title: "Personal Dictionary", 
      icon: "icons/icon_18.png", 
      onclick: function(event) {
         
      },
      popup: {
         href: 'popup.html',
         width: '340px'
      }
   };
   
   setInterval(function()
   {
      getWords(null, null, null, true);
   }, 100*60*60);

   var toolBarButton = null;
   toolBarButton = opera.contexts.toolbar.createItem(UIItemProperties);
   
   opera.contexts.toolbar.addItem(toolBarButton);   
   
   
   opera.extension.onconnect = function(event) 
   {
      event.source.postMessage({message:"loaded", data:"true"}); 
   }
   
}, false);



opera.extension.onmessage = function (event) 
{

   switch(event.data.action) 
   {
      case "get":
         getWords(event.data.backMessage, event);
         break;
      
      case "write":
         writeWord(event.data.word, event.data.meaning, event);
         break;
         
      case "delete":
         deleteWordFromStorage(event.data.word, event);
         break;
         
      case "prepare_synchronize":
         synchronizeWithServer(event);
         break;
        
      case "synchronize":
         sendDataToWeb(event);
         break;
         
      case "login":
         loginViaWeb(event.data.userId, event);
         break;
         
      case "createAcc":
         createAccViaWeb(event.data.userId, event);
         break;
         
      case "get_username":
         event.source.postMessage({message:event.data.backMessage, data:getUserID()}); 
         break;
   }
};