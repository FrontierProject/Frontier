//Array.prototype.toSet = function() {
//    var setObj = new Set();
//
//    this.forEach(function(value) {
//        setObj.add(value);
//    });
//
//    return setObj;
//};

Set.prototype.toArray = function () {
    var arrayObj = [];

    this.forEach(function (value) {
        arrayObj.push(value);
    });

    return arrayObj;
};

(function () {

    var nodes = {};
    var forwardLinks = {};
    var backLinks = {};

    function ForkedLinks(target) {
        var targetUrl = new URL(target);
        var targetUrlStr = targetUrl.host + targetUrl.pathname;

        ////var nodesSet = new Set();
        //var forwardLinksArr = [];
        //var backLinksArr    = [];

        ////nodesSet.add(nodes[targetUrlStr]);

        //if (forwardLinks[targetUrlStr]) {
        //    forwardLinks[targetUrlStr].forEach(function(urlStr) {
        //        //nodesSet.add(nodes[urlStr]);
        //        forwardLinksArr.push({
        //            source: nodes[targetUrlStr],
        //            target: nodes[urlStr]
        //        });
        //    });
        //}

        //if (backLinks[targetUrlStr]) {
        //    backLinks[targetUrlStr].forEach(function(urlStr) {
        //        //nodesSet.add(nodes[urlStr]);
        //        backLinksArr.push({
        //            source: nodes[urlStr],
        //            target: nodes[targetUrlStr]
        //        });
        //    });
        //}

        ////return {
        ////    nodes: nodesSet.toArray(),
        ////    links: linksArr
        ////};

        return {
            forwardLinks: forwardLinks[targetUrlStr] ? forwardLinks[targetUrlStr].toArray() : [],
            backLinks: backLinks[targetUrlStr] ? backLinks[targetUrlStr].toArray() : []
        };
    };

    function AddLink(link, sender) {
        var targetUrl = new URL(link.target);
        var targetUrlStr = targetUrl.host + targetUrl.pathname;

        if (!(nodes[targetUrlStr])) {
            nodes[targetUrlStr] = {
                url: targetUrlStr,
                title: link.title
            };
        } else {
            nodes[targetUrlStr].title = link.title;
        }

        if (link.source.length > 0) {
            var sourceUrl = new URL(link.source);
            var sourceUrlStr = sourceUrl.host + sourceUrl.pathname;

            if (sourceUrlStr != targetUrlStr) {
                if (!(nodes[sourceUrlStr])) {
                    nodes[sourceUrlStr] = {
                        url: sourceUrlStr
                    };
                }

                if (!(forwardLinks[sourceUrlStr])) {
                    forwardLinks[sourceUrlStr] = new Set();
                }
                if (!(backLinks[targetUrlStr])) {
                    backLinks[targetUrlStr] = new Set();
                }

                forwardLinks[sourceUrlStr].add(targetUrlStr);
                backLinks[targetUrlStr].add(sourceUrlStr);
            }
        }
    }

    function FlattenNodesLinks(nodesObj, linksObj) {
        var nodesArr = [];
        var indices = {};
        var index = 0;

        Object.keys(nodesObj).forEach(function (node) {
            nodesArr.push(nodesObj[node]);
            indices[node] = index++;
        });

        var linksArr = [];

        Object.keys(linksObj).forEach(function (sourceUrlStr) {
            linksObj[sourceUrlStr].forEach(function (targetUrlStr) {
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

    chrome.runtime.onMessage.addListener(function (request, sender, SendResponse) {
        if (request.type == "ADD_LINK") {
            SendResponse(AddLink(request, sender));
        } else if (request.type == "HISTORY_PAGE") {
            SendResponse(FlattenNodesLinks(nodes, forwardLinks));
        } else if (request.type == "FORKED_LINKS") {
            SendResponse(ForkedLinks(request.url));
        } else if (request.type == "OPEN_HISTORY") {
            chrome.tabs.create({ "url": "chrome://history", "active": true});
        }
    });
    

    chrome.browserAction.onClicked.addListener(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "SHOW_BANNER"});
        });
        
    });

}());