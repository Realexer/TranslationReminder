var toolBarButton = null;
window.addEventListener("load", function() {
   
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
   
   setInterval(function(){
      getWords(null, null, null, true);
   }, 100*60*60);

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
}

/**                        **
 *    STORAGE MANAGEMENT   **
 *                         */

/**
 * return Array
 */
var extension = true;

function getDb()
{
   opera.postError("Windows is: " + window);
   var db = window.openDatabase('YMDB', '1.0', 'Your meaning database', 2 * 1024 * 1024);
   db.transaction(function (tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS words (word, meaning, toDelete, toEdit, userName, date)', null, null,
         function(tx, error) 
         {
            opera.postError("Error: " + error);
         });
   });
   
   return db;
}



function getWords(backMessage, event, callback, autosynch) 
{
   var userName = getUserID();
   if(!userName)
      return;

   var db = getDb();
   opera.postError("DB: " + db);
   db.transaction(function (tx) {
      
      opera.postError("TX: " + tx);
      var toDelete = "toDelete = 0";
      if(callback || autosynch) {
         toDelete = "1";
      }
      tx.executeSql('SELECT * FROM words WHERE userName =? AND ' + toDelete + " ORDER BY date DESC", [userName], 
      function (tx, results) 
      {
        opera.postError("Result length: " + results.rows.length);
        var callbackArray = new Array();
        for( var i = 0; i < results.rows.length; i ++ ) 
        {
           callbackArray.push
           ({
              word:results.rows.item(i).word, 
              meaning:results.rows.item(i).meaning,
              toDelete:results.rows.item(i).toDelete,
              toEdit:results.rows.item(i).toEdit,
              date:results.rows.item(i).date
           });
        }
        if(callback) {
           event.source.postMessage({message:"begin_synchronize", words:callbackArray}); 
           
        } else if(autosynch) {
           sendDataToWeb({data:{words:callbackArray}});
           
        } else {
           event.source.postMessage({message:backMessage, data:callbackArray}); 
        }
      },
      function(tx, error) {
         opera.postError("Get error: " + error);
      });
   });

}

/**
 * return void
 */
function writeWord(word, meaning, event, date) 
{
   var userName = getUserID();
   if(!userName) {
      event.source.postMessage({message:"no_user"}); 
      toolBarButton.click();
      return;
   }
   
   word = fullTrim(word);
   opera.postError("Write data: " + word + meaning + event);
   var db = getDb();
   db.transaction(function (tx) 
   {
      
      if(date == undefined || date == null) {
         date = new Date().getTime();
      }
      date = parseInt(date);
      tx.executeSql('INSERT INTO words (word, meaning, toDelete, toEdit, userName, date) ' +
                    ' VALUES (?, ?, 0, 0, ?, ?)', [word.toLowerCase(), meaning, userName, date], 
         function (tx, results) 
         {
            if(event) {
               event.source.postMessage({message:"writed"}); 
            }
         },
         function(tx, error) {
            opera.postError("Write error: " + error);
        });
   });
}

function deleteWordFromStorage (word, event) 
{
   var userName = getUserID();
   if(!userName)
      return;
   
   word = fullTrim(word);
   var db = getDb();
   db.transaction(function (tx) {
      tx.executeSql('UPDATE words SET toDelete=1 WHERE (word)=? AND (userName)=?', [word.toString().toLowerCase(), userName], 
         function (tx, results) 
         {
            if(event) {
               event.source.postMessage({message:"deleted", data:word}); 
            }
         },
         function(tx, error) {
            opera.postError("Delete error: " + error);
        });
   }); 
}

function deleteAllWordsFromStorage (event) 
{
   var userName = getUserID();
   if(!userName)
      return;
   
   var db = getDb();
   db.transaction(function (tx) {
      tx.executeSql('DELETE FROM words WHERE (userName) = ?', [userName], 
         function (tx, results) 
         {
            if(event) {
               event.source.postMessage({message:"deleted", data:word}); 
            }
         },
         function(tx, error) {
            opera.postError("Delete error: " + error);
        });
   });
 
}



/***
 * Synchronization
 *
 ***/
function synchronizeWithServer(event) 
{
   getWords(null, event, "_syncronize");
}

function sendDataToWeb(event)
{
   opera.postError("Web Request Data:"+ event.data.data);
   ajax({
      type: "POST",
      url: "http://lf.inegata.ru/YM/UpdateWords",
      callback: function(data) 
      {
         opera.postError("Web Response Data:"+ data);
         var updatedData = jsonParse(data);
         if(updatedData.ret_code) 
         {
            var updatedWords = updatedData.data;
            opera.postError("Words:", updatedWords);
            
            deleteAllWordsFromStorage(null);

            for(var i = 0; i < updatedWords.length; i++) 
            {
               var curWord = updatedWords[i];
               writeWord(curWord.word, curWord.meaning, null, curWord.date);
            }

            if(event.source) 
            {
               event.source.postMessage({message:"synchronized"}); 
            }
            
         }
      },
      data: 
         {
            data: 
            {
               userName: getUserID(),
               words: event.data.words
            }
         }
   });
}


function  loginViaWeb(userId, event) 
{
   opera.postError("Web login with:" + userId);
   ajax({
      type: "POST",
      url: "http://lf.inegata.ru/YM/CheckUser",
      callback: function(data) 
      {
         opera.postError("Web Response Login Data:"+ data);
         
         if(data == "1") 
         {
            saveUserID(userId);
            event.source.postMessage({message:"logined"}); 
         }
         else 
         {
            event.source.postMessage({message:"login_failed"}); 
         }
      },
      data: 
         {
            data: 
            {
               userName: userId
            }
         }
   });
}
         
function createAccViaWeb(userId, event) 
{
   opera.postError("Web create acc with:" + userId);
   ajax({
      type: "POST",
      url: "http://lf.inegata.ru/YM/AddUser",
      callback: function(data) 
      {
         opera.postError("Web Response Create Acc Data:"+ data);
         
         if(data == "1") 
         {
            saveUserID(userId);
            event.source.postMessage({message:"acc_created"}); 
         }
         else 
         {
            event.source.postMessage({message:"acc_created_failed"}); 
         }
      },
      data: 
         {
            data: 
            {
               userName: userId
            }
         }
   });
}


/** UserId Local Access */
function saveUserID(userId) 
{
   localStorage.setItem("userId", userId);
}

function getUserID() 
{
   var userId;
   try {
      userId = localStorage.getItem("userId");
   } catch (ex) {
      opera.postError("User ID Access error: " + ex.toString());
   }
   
   return userId;
}



/*******************************************************************************************************
 *******************************************************************************************************
 *******************************************************************************************************
 *******************************************************************************************************
 **/



/**
 *  Private Functions
 */
function fullTrim(s)
{
   return trim(trim(trim(s), "\n"), "\r");
}


function trim(s, symbol)
{
   if(symbol == undefined) {
      symbol = ' ';
   }
	var l=0;var r=s.length -1;
	while(l < s.length && s[l] == symbol)
	{l++;}
	while(r > l && s[r] == symbol)
	{r-=1;}
	return s.substring(l, r+1);
}








/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function ajax(params) 
{
   var xmlhttp;
   var sendData = "";
   
   // create crossbrowser xmlHttpRequest
   if (window.XMLHttpRequest)
   {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
   }
   else
   {// code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
   }
   
   xmlhttp.onreadystatechange = function()
   {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
         params.callback(xmlhttp.responseText, xmlhttp.status);
      }
   }
      
   sendData = objectToHttpParam(params.data);
   
   if(params.type.toString().toUpperCase() == 'POST') 
   {
      xmlhttp.open(params.type, params.url, false);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.setRequestHeader("Content-length", sendData.length);
      xmlhttp.setRequestHeader("Connection", "close");
      
      xmlhttp.send(sendData);
   } 
   else 
   {
      xmlhttp.open(params.type, params.url + "?" + sendData, false);
      xmlhttp.send(null);
   }   
}


function objectToHttpParam (dataObject, _key) 
{
   var retStr = "";
   
   for (var key in dataObject) 
   {
      var value = dataObject[key];
      
      if(_key) {
         key = _key + "[" + key + "]";
      }
      
      if( Object.prototype.toString.call( value ) === '[object Array]' ) 
      {
         for( var i = 0; i < value.length; i++ ) 
         {
            var tmpValue = value[i];
            if( typeof tmpValue === 'string' ) 
            {
               retStr += encodeURIComponent(key) + "[]=" + encodeURIComponent(tmpValue) +"&";
            } else {
               retStr += objectToHttpParam(tmpValue, key + "[" + i + "]");
            }
            
         }
      }
      else if( Object.prototype.toString.call( value ) === '[object Object]' ) 
      {
         retStr += objectToHttpParam(value, key);
      }
      else
      {
         retStr += encodeURIComponent(key) + "=" + encodeURIComponent(value) +"&";
      }
   }
   
   opera.postError("Web Request Post Data:"+ retStr);
   
   return retStr;  
}


/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


// This source code is free for use in the public domain.
// NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

// http://code.google.com/p/json-sans-eval/

/**
 * Parses a string of well-formed JSON text.
 *
 * If the input is not well-formed, then behavior is undefined, but it is
 * deterministic and is guaranteed not to modify any object other than its
 * return value.
 *
 * This does not use `eval` so is less likely to have obscure security bugs than
 * json2.js.
 * It is optimized for speed, so is much faster than json_parse.js.
 *
 * This library should be used whenever security is a concern (when JSON may
 * come from an untrusted source), speed is a concern, and erroring on malformed
 * JSON is *not* a concern.
 *
 *                      Pros                   Cons
 *                    +-----------------------+-----------------------+
 * json_sans_eval.js  | Fast, secure          | Not validating        |
 *                    +-----------------------+-----------------------+
 * json_parse.js      | Validating, secure    | Slow                  |
 *                    +-----------------------+-----------------------+
 * json2.js           | Fast, some validation | Potentially insecure  |
 *                    +-----------------------+-----------------------+
 *
 * json2.js is very fast, but potentially insecure since it calls `eval` to
 * parse JSON data, so an attacker might be able to supply strange JS that
 * looks like JSON, but that executes arbitrary javascript.
 * If you do have to use json2.js with untrusted data, make sure you keep
 * your version of json2.js up to date so that you get patches as they're
 * released.
 *
 * @param {string} json per RFC 4627
 * @param {function (this:Object, string, *):*} opt_reviver optional function
 *     that reworks JSON objects post-parse per Chapter 15.12 of EcmaScript3.1.
 *     If supplied, the function is called with a string key, and a value.
 *     The value is the property of 'this'.  The reviver should return
 *     the value to use in its place.  So if dates were serialized as
 *     {@code { "type": "Date", "time": 1234 }}, then a reviver might look like
 *     {@code
 *     function (key, value) {
 *       if (value && typeof value === 'object' && 'Date' === value.type) {
 *         return new Date(value.time);
 *       } else {
 *         return value;
 *       }
 *     }}.
 *     If the reviver returns {@code undefined} then the property named by key
 *     will be deleted from its container.
 *     {@code this} is bound to the object containing the specified property.
 * @return {Object|Array}
 * @author Mike Samuel <mikesamuel@gmail.com>
 */
var jsonParse = (function () {
  var number
      = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
  var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]'
      + '|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
  var string = '(?:\"' + oneChar + '*\")';

  // Will match a value in a well-formed JSON file.
  // If the input is not well-formed, may match strangely, but not in an unsafe
  // way.
  // Since this only matches value tokens, it does not match whitespace, colons,
  // or commas.
  var jsonToken = new RegExp(
      '(?:false|true|null|[\\{\\}\\[\\]]'
      + '|' + number
      + '|' + string
      + ')', 'g');

  // Matches escape sequences in a string literal
  var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');

  // Decodes escape sequences in object literals
  var escapes = {
    '"': '"',
    '/': '/',
    '\\': '\\',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t'
  };
  function unescapeOne(_, ch, hex) {
    return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
  }

  // A non-falsy value that coerces to the empty string when used as a key.
  var EMPTY_STRING = new String('');
  var SLASH = '\\';

  // Constructor to use based on an open token.
  var firstTokenCtors = {'{': Object, '[': Array};

  var hop = Object.hasOwnProperty;

  return function (json, opt_reviver) {
    // Split into tokens
    var toks = json.match(jsonToken);
    // Construct the object to return
    var result;
    var tok = toks[0];
    var topLevelPrimitive = false;
    if ('{' === tok) {
      result = {};
    } else if ('[' === tok) {
      result = [];
    } else {
      // The RFC only allows arrays or objects at the top level, but the JSON.parse
      // defined by the EcmaScript 5 draft does allow strings, booleans, numbers, and null
      // at the top level.
      result = [];
      topLevelPrimitive = true;
    }

    // If undefined, the key in an object key/value record to use for the next
    // value parsed.
    var key;
    // Loop over remaining tokens maintaining a stack of uncompleted objects and
    // arrays.
    var stack = [result];
    for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
      tok = toks[i];

      var cont;
      switch (tok.charCodeAt(0)) {
        default:  // sign or digit
          cont = stack[0];
          cont[key || cont.length] = +(tok);
          key = void 0;
          break;
        case 0x22:  // '"'
          tok = tok.substring(1, tok.length - 1);
          if (tok.indexOf(SLASH) !== -1) {
            tok = tok.replace(escapeSequence, unescapeOne);
          }
          cont = stack[0];
          if (!key) {
            if (cont instanceof Array) {
              key = cont.length;
            } else {
              key = tok || EMPTY_STRING;  // Use as key for next value seen.
              break;
            }
          }
          cont[key] = tok;
          key = void 0;
          break;
        case 0x5b:  // '['
          cont = stack[0];
          stack.unshift(cont[key || cont.length] = []);
          key = void 0;
          break;
        case 0x5d:  // ']'
          stack.shift();
          break;
        case 0x66:  // 'f'
          cont = stack[0];
          cont[key || cont.length] = false;
          key = void 0;
          break;
        case 0x6e:  // 'n'
          cont = stack[0];
          cont[key || cont.length] = null;
          key = void 0;
          break;
        case 0x74:  // 't'
          cont = stack[0];
          cont[key || cont.length] = true;
          key = void 0;
          break;
        case 0x7b:  // '{'
          cont = stack[0];
          stack.unshift(cont[key || cont.length] = {});
          key = void 0;
          break;
        case 0x7d:  // '}'
          stack.shift();
          break;
      }
    }
    // Fail if we've got an uncompleted object.
    if (topLevelPrimitive) {
      if (stack.length !== 1) {throw new Error();}
      result = result[0];
    } else {
      if (stack.length) {throw new Error();}
    }

    if (opt_reviver) {
      // Based on walk as implemented in http://www.json.org/json2.js
      var walk = function (holder, key) {
        var value = holder[key];
        if (value && typeof value === 'object') {
          var toDelete = null;
          for (var k in value) {
            if (hop.call(value, k) && value !== holder) {
              // Recurse to properties first.  This has the effect of causing
              // the reviver to be called on the object graph depth-first.

              // Since 'this' is bound to the holder of the property, the
              // reviver can access sibling properties of k including ones
              // that have not yet been revived.

              // The value returned by the reviver is used in place of the
              // current value of property k.
              // If it returns undefined then the property is deleted.
              var v = walk(value, k);
              if (v !== void 0) {
                value[k] = v;
              } else {
                // Deleting properties inside the loop has vaguely defined
                // semantics in ES3 and ES3.1.
                if (!toDelete) {toDelete = [];}
                toDelete.push(k);
              }
            }
          }
          if (toDelete) {
            for (var i = toDelete.length; --i >= 0;) {
              delete value[toDelete[i]];
            }
          }
        }
        return opt_reviver.call(holder, key, value);
      };
      result = walk({'': result}, '');
    }

    return result;
  };
})();