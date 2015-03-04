
chrome.browserAction.onClicked.addListener(function (tab) {
    
    chrome.extension.sendMessage({ tab: { event:"forward" } }, function (response) {
        console.log(response.farewell);
    });

});