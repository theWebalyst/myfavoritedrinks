(function() {
  var inputElement;
  var formElement;
  var ulElement;
  var drinkRowPrefix = 'drinkrow-';

  function prefixId(id) {
    return drinkRowPrefix + id;
  }
  function unprefixId(prefixedId) {
    return prefixedId.replace(drinkRowPrefix, '');
  }

  function init() {
    formElement = document.getElementById('add-drink');
    inputElement = formElement.getElementsByTagName('input')[0];
    ulElement = document.getElementById('drink-list');

    RemoteStorage.config.changeEvents.window = true;
    remoteStorage.access.claim('myfavoritedrinks', 'rw');
    
    // mrhTODO - review...
    // SAFE Network backend requires application identity and required permissions rather than
    // API keys (authentication is handled by the user via SAFE Launcher, not a server)
    remoteStorage.setApiKeys('safestore', 
		{	
            // For details see SAFE Launcher /auth JSON API
			app: {
			    name: 'RemoteStorage Demo',		// Your app name etc.
			    version: '0.0.1',
			    vendor: 'remoteStorage',
			    id: 'org.remotestorage.rsdemo'	// Identifies stored data (unique per vendor)
			},
			permissions: ['SAFE_DRIVE_ACCESS']  // List of permissions to request. On authorisation, 
												// holds permissions granted by user
		}
    ); 
//remoteStorage.disconnect();//mrhTODO disconnect() to start with a clean slate every time

    // Googledrive option
    remoteStorage.setApiKeys('googledrive', {
       clientId: '857377956471-0qma3pqj34k7sio6d17bhnu3rvjqu57e.apps.googleusercontent.com'
    });
    
    remoteStorage.displayWidget();
    remoteStorage.myfavoritedrinks.init();
    remoteStorage.myfavoritedrinks.on('change', function(event) {
      console.log('change from '+event.origin, event);
      // add
      if(event.newValue && (! event.oldValue)) {
        displayDrink(event.relativePath, event.newValue.name);
      }
      // remove
      else if((! event.newValue) && event.oldValue) {
        undisplayDrink(event.relativePath);
      }
    });

    remoteStorage.on('ready', function() {

      remoteStorage.on('disconnected', function() {
        emptyDrinks();
      });

      ulElement.addEventListener('click', function(event) {
        if(event.target.tagName === 'SPAN') {
          removeDrink(unprefixId(event.target.parentNode.id));
        }
      });

      formElement.addEventListener('submit', function(event) {
        event.preventDefault();
        var trimmedText = inputElement.value.trim();
        if(trimmedText) {
          addDrink(trimmedText);
        }
        inputElement.value = '';
      });

    });
  }

  function addDrink(name) {
    remoteStorage.myfavoritedrinks.addDrink(name);
  }

  function removeDrink(id) {
    remoteStorage.myfavoritedrinks.removeDrink(id);
  }

  function displayDrinks(drinks) {
    for(var drinkId in drinks) {
      displayDrink(drinkId, drinks[drinkId].name);
    }
  }

  function displayDrink(id, name) {
    var domID = prefixId(id);
    var liElement = document.getElementById(domID);
    if(! liElement) {
      liElement = document.createElement('li');
      liElement.id = domID;
      ulElement.appendChild(liElement);
    }
    liElement.appendChild(document.createTextNode(name));//this will do some html escaping
    liElement.innerHTML += ' <span title="Delete">×</span>';
  }

  function undisplayDrink(id) {
    var elem = document.getElementById(prefixId(id));
    ulElement.removeChild(elem);
  }

  function emptyDrinks() {
    ulElement.innerHTML = '';
    inputElement.value = '';
  }

  document.addEventListener('DOMContentLoaded', init);

})();
