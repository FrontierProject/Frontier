$(window).load(function(){
    $(document).ready((function (){
   
    //Tested code here: http://jsfiddle.net/mvCUH/198/

        var tmplt = "<li class=\"list_item\"><p>{{url}}</p></li>";
        
        var forwardData = "";
        var backData = "";
        
        var backLinks = [], forwardLinks = [];

        //functions
        //dynamically populates the list and animates
        // function updateList() {
            
            // // Only display when there is a fork
            // if (backLinks.length > 1)
            // {
                // var backContainer = d3.select("body").append("div")
                    // .attr("id", "back_list_container")
                    // .attr("class", "yui3-cssreset");
                
                // var backList = backContainer.append("ul")
                    // .attr("id", "back_url_list")
                    // .selectAll("li")
                    // .data(backLinks)
                    // .enter()
                    // .append("li")
                    // .append("p")
                    // .text(function(link) { return link; });
            // }
            
            // // Only display when there is a fork
            // if (forwardLinks.length > 1)
            // {
                // var forwardContainer = d3.select("body").append("div")
                    // .attr("id", "forward_list_container")
                    // .attr("class", "yui3-cssreset");
                
                // var forwardList = forwardContainer.append("ul")
                    // .attr("id", "forward_url_list")
                    // .selectAll("li")
                    // .data(forwardLinks)
                    // .enter()
                    // .append("li")
                    // .append("p")
                    // .text(function(link) { return link; });
            // }
        // }
        
        function rightBanner()
        {
             // Appends the div
            var bannerContainer = d3.select("body").append("div")
                .attr("id", "frontier_banner")
                .attr("class", "yui3-cssreset");
            
            // The link icons are in an unordered list
            var bannerLinks = bannerContainer.append("ul")
                .attr("id", "frontier_banner_list");
            
            // Adds the close button to the top right of the banner
            var closeButton = bannerLinks.append("li")
                .attr("id", "frontier_close_button")
                
                .append("img")
                .attr("src", chrome.extension.getURL("img/close_icon_16.png"));
            
            $("#frontier_close_button").click(function () {
                hideBanner = setTimeout(function() {
                    $("#frontier_banner").slideUp();
                }, 0);
            });
            
            // Add the history button
            var historyButton = bannerLinks.append("li")
                .attr("id", "frontier_history_button");
            
            historyButton.append("img")
                .attr("src", chrome.extension.getURL("img/history_icon_16.png"));
            
            $("#frontier_history_button").click(function () {
                chrome.runtime.sendMessage({
                    type: "OPEN_HISTORY"
                });
            });       
            
            // Add the forward link image
            var forwardLinkButton = bannerLinks.append("li")
                .attr("id", "frontier_forwardlinks")
            
            forwardLinkButton.append("img")
                .attr("src", chrome.extension.getURL("img/forward_icon_16.png"));
            
            // Add all of the forward links
            forwardLinkButton.append("ul")
                .selectAll("li")
                .data(forwardLinks)
                .enter()
                .append("li")
                .append("a")
                .attr("href", function(link) { 
                    if (window.location.protocol == "https:")
                        return "https://" + link;
                    else
                        return "http://" + link;
                })
                .attr("target", "_blank")
                .text(function(link) { return link; });
            
            // Add the back link image
            var backLinkButton = bannerLinks.append("li")
                .attr("id", "frontier_backlinks")
                
            backLinkButton.append("img")
                .attr("src", chrome.extension.getURL("img/back_icon_16.png"));
            
            // Add all of the back links
            backLinkButton.append("ul")
                .selectAll("li")
                .data(backLinks)
                .enter()
                .append("li")
                .append("a")
                .attr("href", function(link) { 
                    if (window.location.protocol == "https:")
                        return "https://" + link;
                    else
                        return "http://" + link;
                })
                .attr("target", "_blank")
                .text(function(link) { return link; });
            
            bannerContainer.append("span")
                .text("FRONTIER");
            
            bannerContainer.append("img")
                .style("float", "right")
                .attr("src", chrome.extension.getURL("img/frontier_icon_16.png"));
            
            // Keep the banner showing while the mouse is in it
            $("#frontier_banner").mouseenter( function(event) {
                clearTimeout(hideBanner);
            });
            
            // When mouse leaves, hide it after 2 seconds
            $("#frontier_banner").mouseleave( function(event) {
                hideBanner = setTimeout(function() {
                    $("#frontier_banner").slideUp();
                }, 5000);
            });
        }
        
        // Injects banner into current page
        function addBanner()
        {
            // Appends the div
            var bannerContainer = d3.select("body").append("div")
                .attr("id", "frontier_banner")
                .attr("class", "yui3-cssreset");
            
            // The link icons are in an unordered list
            var bannerLinks = bannerContainer.append("ul")
                .attr("id", "frontier_banner_list");
            
            var backLinkButton = bannerLinks.append("li")
                .attr("id", "frontier_backlinks");
            
            // Add the back link image
            backLinkButton.append("img")
                .attr("src", chrome.extension.getURL("img/back_icon_16.png"));
            
            // Add all of the links
            backLinkButton.append("ul")
                .selectAll("li")
                .data(backLinks)
                .enter()
                .append("li")
                .append("a")
                .attr("href", function(link) { 
                    if (window.location.protocol == "https:")
                        return "https://" + link;
                    else
                        return "http://" + link;
                })
                .attr("target", "_blank")
                .text(function(link) { return link; });
                
            var forwardLinkButton = bannerLinks.append("li")
                .attr("id", "frontier_forwardlinks");
           
           // Add the forward link image
            forwardLinkButton.append("img")
                .attr("src", chrome.extension.getURL("img/forward_icon_16.png"));
            
            // Add all of the forward links
            forwardLinkButton.append("ul")
                .selectAll("li")
                .data(forwardLinks)
                .enter()
                .append("li")
                .append("a")
                .attr("href", function(link) { 
                    if (window.location.protocol == "https:")
                        return "https://" + link;
                    else
                        return "http://" + link;
                })
                .attr("target", "_blank")
                .text(function(link) { return link; });
                
            var historyButton = bannerLinks.append("li")
                .attr("id", "frontier_history_button");
            
            historyButton.append("img")
                .attr("src", chrome.extension.getURL("img/history_icon_16.png"));
            
            $("#frontier_history_button").click(function () {
                chrome.runtime.sendMessage({
                    type: "OPEN_HISTORY"
                });
            });
            
            // Adds the close button to the top right of the banner
            var closeButton = bannerContainer.append("span")
                .attr("id", "frontier_close_button")
                .attr("style", "cursor: pointer")
                .append("img")
                .attr("src", chrome.extension.getURL("img/close_icon_16.png"));
            
            $("#frontier_close_button").click(function () {
                hideBanner = setTimeout(function() {
                    $("#frontier_banner").slideUp();
                }, 0);
            });           
            
            // Keep the banner showing while the mouse is in it
            $("#frontier_banner").mouseenter( function(event) {
                clearTimeout(hideBanner);
            });
            
            // When mouse leaves, hide it after 2 seconds
            $("#frontier_banner").mouseleave( function(event) {
                hideBanner = setTimeout(function() {
                    $("#frontier_banner").slideUp();
                }, 5000);
            });
        }
        
        chrome.runtime.sendMessage({
            type: "FORKED_LINKS",
            url: document.URL
        }, function (response) {
            backLinks = response.backLinks;
            forwardLinks = response.forwardLinks;
            // updateList();
            // addBanner();
            rightBanner();
        });
        
        var hideBanner;
        var lastScrollTop = -100;
        
        // Un-hides the banner
        function showBanner() {
            $("#frontier_banner").slideDown(function() {
                clearTimeout(hideBanner);
                hideBanner = setTimeout(function() {
                    $("#frontier_banner").slideUp();
                }, 5000);
            });
        }
        
        // Clicking on the frontier logo shows the banner
        chrome.runtime.onMessage.addListener(function (request) {
            if (request.action == "SHOW_BANNER") {
                showBanner();
            }
        });
        
    }()));
});
