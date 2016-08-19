(function() {

    var KEY_LAST_CHANGED_AT = 'lastChangedAt';
    var KEY_OPTIONS = 'options';
    var KEY_PAUSED = 'paused';

    function now() {
        return new Date().getTime();
    }

    function updateBadge(paused) { 
		if (paused){
			var badgeText = "n\341dal";
		}else{
			var badgeText = "";
		}
		chrome.browserAction.setBadgeText( { text: badgeText } );
    }

    function isPaused() {
        return (localStorage.getItem(KEY_PAUSED) == 'true');
    }

    function setPaused(paused) {
        var lastChangedAt = new Date().getTime();

        localStorage.setItem(KEY_PAUSED, paused);
        chrome.storage.sync.set( { 'paused': paused } );
        updateBadge(paused);

        localStorage.setItem(KEY_LAST_CHANGED_AT, lastChangedAt);
        return lastChangedAt;
    }

    function togglePause(tab) {
        setPaused(!isPaused());

        // Reload the current tab.
        chrome.tabs.update(tab.id, {url: tab.url});
    }

    function getExcluded() {
        var opts = JSON.parse(localStorage.getItem(KEY_OPTIONS));
		if(opts){
			opts = opts['excluded'];
		}else{
			opts = [];
		}
        return opts;
    }

    function onMessage(request, sender, sendResponse) {
        var requestId = request.id;

        if(requestId == 'isPaused?') {
            // TODO: Convert to boolean.
            sendResponse({value: isPaused()});
        }
        else if(requestId == 'getExcluded') {
            sendResponse({value: getExcluded()});
        }
        else if(requestId == 'setOptions') {
            localStorage.setItem(KEY_OPTIONS, request.options);
        }
        else if(requestId == 'getDictionary') {
            sendResponse(dictionary);
        }
    }

    chrome.browserAction.onClicked.addListener(togglePause);
    chrome.extension.onRequest.addListener(onMessage);

    // TODO: Have an option where you can select a specific replacement set, such as "Standard", "Cynical Millenial", etc.
    // TODO: The option value would then be passed into loadDictionary for appropriate dictionary file selection.

    updateBadge(isPaused());

})();
