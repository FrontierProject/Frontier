(function(){

    var viewable = {};
    var graph = new FRONTIER.Graph();

    chrome.tabs.onCreated.addListener(function(tab) {
        if (tab.url) {
            if (viewable[tab.openerTabId]) {
                var source = {url: viewable[tab.openerTabId]};
                var target = {url: tab.url};
                graph.addEdge(source, target);
            }

            viewable[tab.id] = tab.url;
        }
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status === "complete" && tab.url) {
            if (viewable[tabId]){
                var source = {url: viewable[tabId]};
                var target = {url: tab.url};
                graph.addEdge(source, target);
            }

            viewable[tabId] = tab.url;
        }
    });

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        if( viewable[tabId] )
            delete viewable[tabId];
    });

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
        if (request.type === "GetGraph")
            sendResponse({nodes: graph.nodes, links: graph.links} );
        else
            sendResponse({});
    });

}());
