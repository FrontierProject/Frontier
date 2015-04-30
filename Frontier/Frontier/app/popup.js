
$(document).ready((function () {
    const DEFAULT_FAVICON_URL = "http://www.google.com/images/icons/product/chrome-32.png";
    
    var forwardData = "";
    var backData = "";
    
    var backLinks = [], forwardLinks = [];
    
    function addLinks() {
        // Add all of the back links
        var backLinkButton = d3.select("#frontier_backlinks");
        
        var backLinkList = backLinkButton.append("ul")
            .selectAll("li")
            .data(backLinks)
            .enter()
            .append("li");
        
        backLinkList.append("img")
            .attr("src", function(link) { return link.favIconUrl || DEFAULT_FAVICON_URL; })
            .attr("style", "margin: 5px 5px 5px 8px; display: inline-block;")
            .attr("height", "16")
            .attr("width", "16");
        
        backLinkList.append("a")
            .attr("href", function(link) { 
                if (window.location.protocol == "https:")
                    return "https://" + link.url;
                else
                    return "http://" + link.url;
            })
            .text(function(link) { return link.title || link.url; });
        
        // Add all of the forward links
        var forwardLinkButton = d3.select("#frontier_forwardlinks");
        
        var forwardLinkList = forwardLinkButton.append("ul")
            .selectAll("li")
            .data(forwardLinks)
            .enter()
            .append("li")
        
        forwardLinkList.append("img")
            .attr("src", function(link) { return link.favIconUrl || DEFAULT_FAVICON_URL; })
            .attr("style", "margin: 5px 5px 5px 8px; display: inline-block;")
            .attr("height", "16")
            .attr("width", "16");
        
        forwardLinkList.append("a")
            .attr("href", function(link) { 
                if (window.location.protocol == "https:")
                    return "https://" + link.url;
                else
                    return "http://" + link.url;
            })
            .text(function(link) { return link.title || link.url; });
        
        $("#frontier_history_button").click(function () {
            chrome.runtime.sendMessage({
                type: "OPEN_HISTORY"
            });
        });
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "GET_URL"}, function (response) {
            chrome.runtime.sendMessage({
                type: "FORKED_LINKS",
                url: response.url
            }, function (response) {
                backLinks = response.backLinks;
                forwardLinks = response.forwardLinks;
                // updateList();
                // addBanner();
                addLinks();
            });
        });
    });
    
    // Clicking on the frontier logo shows the banner
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.action == "SHOW_BANNER") {
            showBanner();
        }
    });
}()));