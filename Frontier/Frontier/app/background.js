﻿//Array.prototype.toSet = function() {
//    var setObj = new Set();
//
//    this.forEach(function(value) {
//        setObj.add(value);
//    });
//
//    return setObj;
//};


Set.prototype.toArray = function() {
    var arrayObj = [];

    this.forEach(function(value) {
        arrayObj.push(value);
    });

    return arrayObj;
};

(function() {

// node objects with urls, titles, etc.
var nodes         = {};
// hyperlink graph
var forwardLinks = {};
// transpose of above
var backLinks    = {};


// strip out everything except host and pathname
function UrlHostPathname(rawUrl) {
    try {
        var url = new URL(rawUrl);
        return url.host + url.pathname;
    } catch (e) {
        return "";
    }
}

// url lists needed by front-end script
function ForkedLinks(target) {
    var targetUrlStr = UrlHostPathname(target);

    return {
        forwardLinks: forwardLinks[targetUrlStr] ? forwardLinks[targetUrlStr].toArray() : [],
        backLinks: backLinks[targetUrlStr] ? backLinks[targetUrlStr].toArray() : []
    };
};

var blackListedUrls = new Set([
    "www.google.com/webhp",
    "www.google.com/_/chrome/newtab",
    "newtab/"
]);

// add link object graph adjacency lists
// NOTE: we also store the transpose of the url graph
function AddLink(link, sender) {
    var targetUrlStr = UrlHostPathname(link.target);

    if (blackListedUrls.has(targetUrlStr))
        return;

    // insert target node
    if (!(nodes[targetUrlStr])) {
        nodes[targetUrlStr] = {
            url:    targetUrlStr,
            rawUrl: link.target,
            title:  link.title,
        };
    } else {
        nodes[targetUrlStr].title = link.title;
    }

    // timestamp
    //if (!(nodes[targetUrlStr].timestamps)) {
    //    nodes[targetUrlStr].timestamps = [];
    //}
    //nodes[targetUrlStr].timestamps.push(Date.now());
    nodes[targetUrlStr].timestamp = Date.now();

    // screen shot
    //if (!(nodes[targetUrlStr].screenShot)) {
    //    chrome.tabs.captureVisibleTab(sender.tab.windowId, null, function(dataUrl) {
    //        nodes[targetUrlStr].screenShot = dataUrl;
    //    });
    //}

    // check that source URL is a nonempty string
    if (link.source.length > 0) {
        var sourceUrlStr = UrlHostPathname(link.source);

        //  check for a self loop
        if (sourceUrlStr != targetUrlStr) {

            // insert source vertex
            if (!(nodes[sourceUrlStr])) {
                nodes[sourceUrlStr] = {
                    url:    sourceUrlStr,
                    rawUrl: link.source
                };
            }

            if (!(forwardLinks[sourceUrlStr])) {
                forwardLinks[sourceUrlStr] = new Set();
            }
            if (!(backLinks[targetUrlStr])) {
                backLinks[targetUrlStr] = new Set();
            }

            // add vertices to the adjacency lists
            forwardLinks[sourceUrlStr].add(targetUrlStr);
            backLinks[targetUrlStr].add(sourceUrlStr);
        }
    }
}

// convert the node set into a list and collapse adjacency list into a list of node indices
function FlattenNodesLinks(nodesObj, linksObj) {
    var nodesArr = [];
    var indices  = {};
    var index    = 0;

    // convert node object into list and record its index
    Object.keys(nodesObj).forEach(function(node) {
        nodesArr.push(nodesObj[node]);
        indices[node] = index++;
    });

    var linksArr = [];

    // iterate through each source entry
    Object.keys(linksObj).forEach(function(sourceUrlStr) {
        // iterate through each target associated with the current source url
        linksObj[sourceUrlStr].forEach(function(targetUrlStr) {
            // NOTE: these objects are serialized into JSON so object references are lost
            // d3 needs node indices for force directed layout
            linksArr.push({
                source: indices[sourceUrlStr],
                target: indices[targetUrlStr]
            });
        });
    });

    return {
        nodes: nodesArr,
        links: linksArr
    };
}

// workaround for the fact that favicons are not available until the page has finished loading
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var favIconUrl = changeInfo.favIconUrl || tab.favIconUrl;

    // make sure tab actually has a favicon
    if (tab.url && favIconUrl) {
        var targetUrlStr = UrlHostPathname(tab.url);

        if (blackListedUrls.has(targetUrlStr))
            return;

        if (!(nodes[targetUrlStr])) {
            console.log("*** Inserting <" + targetUrlStr + "> in tab listener");
            nodes[targetUrlStr] = {
                url:    targetUrlStr,
                rawUrl: tab.url
            };
        }

        // add favicon url to the node
        // now favicon available whenever the graph is rendered by the front-end
        nodes[targetUrlStr].favIconUrl = favIconUrl;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, SendResponse) {
    if (request.type == "ADD_LINK") {
        SendResponse(AddLink(request, sender));
    } else if (request.type == "HISTORY_PAGE") {
        SendResponse(FlattenNodesLinks(nodes, forwardLinks));
    } else if (request.type == "FORKED_LINKS") {
        SendResponse(ForkedLinks(request.url));
    } else if (request.type == "OPEN_HISTORY") {
        chrome.tabs.create({ 'url': 'chrome://history', 'active': true});
    }
    
});

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "SHOW_BANNER"});
    });
});

}());