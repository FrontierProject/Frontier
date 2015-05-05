//Array.prototype.toSet = function() {
//    return new Set(this);
//};

Set.prototype.toArray = function() {
    var arrayObj = [];

    this.forEach(function(value) {
        arrayObj.push(value);
    });

    return arrayObj;
};

(function() {

var sessions = {};

function AddSession(sessionName) {
    if (!(sessions[sessionName])) {
        sessions[sessionName] = {
            // node objects with urls, titles, etc.
            // Node Object {
            // String url -- stripped url with host and pathname only
            // String rawUrl -- url given by document.URL
            // String title (optional) -- title given by document.title
            // String favIconUrl (optional) -- favicon url, only available once page is fully loaded
            // }
            nodes:        {},
            // hyperlink graph
            forwardLinks: {},
            // transpose of above
            backLinks:    {}
        };
    }
}

const DEFAULT_SESSION = "Default";
var currentSession = DEFAULT_SESSION;
AddSession(DEFAULT_SESSION);

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
    var nodes        = sessions[currentSession].nodes;
    var forwardLinks = sessions[currentSession].forwardLinks;
    var backLinks    = sessions[currentSession].backLinks;

    var forwardArr = [];
    if (forwardLinks[targetUrlStr]) {
        forwardLinks[targetUrlStr].forEach(function(link) {
            if (nodes[link]) {
                forwardArr.push(nodes[link]);
            }
        });
    }

    var backArr    = [];
    if (backLinks[targetUrlStr]) {
        backLinks[targetUrlStr].forEach(function(link) {
            if (nodes[link]) {
                backArr.push(nodes[link]);
            }
        });
    }

    //return {
    //    forwardLinks: forwardLinks[targetUrlStr] ? forwardLinks[targetUrlStr].toArray() : [],
    //    backLinks: backLinks[targetUrlStr] ? backLinks[targetUrlStr].toArray() : []
    //};

    return {
        forwardLinks: forwardArr,
        backLinks:    backArr
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

    var nodes = sessions[currentSession].nodes;

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
    var date = new Date();
    nodes[targetUrlStr].hours   = date.getHours();
    nodes[targetUrlStr].minutes = date.getMinutes();

    // check that source URL is a nonempty string
    if (link.source.length > 0) {
        var sourceUrlStr = UrlHostPathname(link.source);

        //  check for a self loop
        if (sourceUrlStr != targetUrlStr) {
            var forwardLinks = sessions[currentSession].forwardLinks;
            var backLinks    = sessions[currentSession].backLinks;

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

// workaround: favicons are not available until the page has finished loading
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var nodes      = sessions[currentSession].nodes;
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
        //SendResponse(AddLink(request, sender));
        AddLink(request, sender);
    } else if (request.type == "HISTORY_PAGE") {
        SendResponse(FlattenNodesLinks(sessions[currentSession].nodes, sessions[currentSession].forwardLinks));
    } else if (request.type == "FORKED_LINKS") {
        SendResponse(ForkedLinks(request.url));
    } else if (request.type == "OPEN_HISTORY") {
        chrome.tabs.create({ 'url': 'chrome://history', 'active': true});
    } else if (request.type == "ADD_SESSION") {
        if (request.sessionName) {
            var sessionName = request.sessionName;
            if (!sessions[sessionName]) {
                AddSession(sessionName);
            }
            currentSession = sessionName;
        }
    } else if (request.type == "SWITCH_SESSION") {
        if (request.sessionName) {
            currentSession = request.sessionName;
        }
    } else if (request.type == "GET_SESSIONS") {
        SendResponse({
            currentSession: currentSession,
            sessions:       Object.keys(sessions)
        });
    }
    else if (request.type == "CLEAR_HISTORY") {
        sessions = {};
        currentSession = DEFAULT_SESSION;
        AddSession(DEFAULT_SESSION);
    }
});

}());
