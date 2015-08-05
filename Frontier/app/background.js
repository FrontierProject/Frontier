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
var pageCount = 0;
const DEFAULT_SESSION = "Default";
var currentSession = DEFAULT_SESSION;

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
    currentSession = sessionName;
}

//Excecuted once
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
    "www.google.com/_/chrome/newtab",
    "newtab/",
    "chrome://history/",
    "chrome://extensions/",
    "chrome://settings/",
    "chrome://help/"
]);

// add link object graph adjacency lists
// NOTE: we also store the transpose of the url graph
function AddLink(link, sender) {
    var targetUrlStr = UrlHostPathname(link.target);
    var sourceUrlStr = UrlHostPathname(link.source);
    var sourceUrlLength = link.source.length;

    if (blackListedUrls.has(targetUrlStr))
        return;

    var nodes = sessions[currentSession].nodes;

    // timestamp
    //if (!(nodes[targetUrlStr].timestamps)) {
    //    nodes[targetUrlStr].timestamps = [];
    //}
    //nodes[targetUrlStr].timestamps.push(Date.now());

    // insert target node
    if (!(nodes[targetUrlStr])) {
        nodes[targetUrlStr] = {
            url: targetUrlStr,
            rawUrl: link.target,
            title: link.title,
            pageIndex: pageCount
        };
        pageCount += 1;
    } else {
        nodes[targetUrlStr].title = link.title;
    }
    //nodes[targetUrlStr].dateTime.push(date);

    // check that source URL is a nonempty string
    if (sourceUrlLength > 0) {

        //  check for a self loop
        if (sourceUrlStr != targetUrlStr) {
            var forwardLinks = sessions[currentSession].forwardLinks;
            var backLinks    = sessions[currentSession].backLinks;

            // insert source vertex
            if (!(nodes[sourceUrlStr])) {
                nodes[sourceUrlStr] = {
                   url:    sourceUrlStr,
                   rawUrl: link.source,
                   title: link.source.title,
                   pageIndex: pageCount,
                };
                pageCount += 1;
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

function RemoveLink(pageIndex, sender) {
    var nodes = sessions[currentSession].nodes;
    var targetURL = "";
    console.log(pageIndex);

    for (var page in nodes) {

        if (nodes[page].hasOwnProperty('url') && nodes[page].pageIndex.toString() == pageIndex) {
            targetURL = nodes[page].url;
            delete nodes[page];
        }
    }
    
    //Edges will be deleted on refresh
    if (typeof targetURL != undefined && targetURL != "") {
        var forwardLinks = sessions[currentSession].forwardLinks;
        var backLinks = sessions[currentSession].backLinks; 

        for (var page in forwardLinks) {
            if (forwardLinks[page].has(targetURL)) {
                forwardLinks[page].delete(targetURL);
            }
        }
        if (forwardLinks.hasOwnProperty(targetURL)) {
            delete forwardLinks[targetURL];
        }

        for (var page in backLinks) {
            if (backLinks[page].has(targetURL)) {
                backLinks[page].delete(targetURL);
            }
        }
        if (backLinks.hasOwnProperty(targetURL)) {
            delete backLinks[targetURL];
        }

        chrome.history.deleteUrl({ url: targetURL }, function () {
            if (chrome.runtime.lastError) {
                console.log(targetURL);
                console.log(chrome.runtime.lastError.message);
            } else {
                //URL exists and is deleted
            }
        });
    }
}

// convert the node set into a list and collapse adjacency list into a list of node indices
function FlattenNodesLinks(nodesObj, linksObj) {
    var nodesArr = [];
    var indices  = {};

    // convert node object into list and record its index
    Object.keys(nodesObj).forEach(function(node) {
        if (nodesObj[node] !== null && nodesObj[node] !== undefined) {
            nodesArr.push(nodesObj[node]);
            console.log(nodesObj[node]);
            indices[node] = nodesObj[node].pageIndex;
        }
    });

    var linksArr = [];

    // iterate through each source entry
    Object.keys(linksObj).forEach(function(sourceUrlStr) {
        // iterate through each target associated with the current source url
        if (linksObj[sourceUrlStr] !== null && linksObj[sourceUrlStr] !== undefined) {
            linksObj[sourceUrlStr].forEach(function (targetUrlStr) {
                // NOTE: these objects are serialized into JSON so object references are lost
                // d3 needs node indices for force directed layout
                linksArr.push({
                    source: indices[sourceUrlStr],
                    target: indices[targetUrlStr]
                });
            });
        }
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
                rawUrl: tab.url,
                title: tab.title,
                pageIndex: pageCount
            };

            /*
            var day = date.getDate();
            var month = date.getMonth() + 1; //January is 0
            var year = date.getFullYear();

            if (day < 10) {
                day = '0' + day
            }

            if (month < 10) {
                month = '0' + month
            }*/

            pageCount++;
        }
        
        // add favicon url to the node
        // now favicon available whenever the graph is rendered by the front-end
        nodes[targetUrlStr].favIconUrl = favIconUrl;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, SendResponse) {
    if (request.type == "ADD_LINK") {
        AddLink(request, sender);
    }
    else if (request.type == "REMOVE_LINK") {
        RemoveLink(request.pageIndex, sender);
    }
    else if (request.type == "HISTORY_PAGE") {
        SendResponse(FlattenNodesLinks(sessions[currentSession].nodes, sessions[currentSession].forwardLinks));
    } else if (request.type == "FORKED_LINKS") {
        SendResponse(ForkedLinks(request.url));
    } else if (request.type == "OPEN_HISTORY") {
        chrome.tabs.create({ 'url': 'chrome://history', 'active': true});
    } else if (request.type == "ADD_SESSION") {
        if (request.sessionName) {
            var sessionName = request.sessionName;
            AddSession(sessionName);
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
