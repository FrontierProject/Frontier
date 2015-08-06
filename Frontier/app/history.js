Array.prototype.has = function(value) {
    var setObj = new Set(this);
    return setObj.has(value);
};

$(document).ready((function () {

    chrome.runtime.sendMessage({ type: "HISTORY_PAGE" }, function (response) {
        
        //trims Urls to simple host name
        function UrlHostName(rawUrl) {
            try {
                var url = new URL(rawUrl);
                return url.host;
            } catch (e) {
                return "";
            }
        }

        const DEFAULT_FAVICON_URL = "http://www.google.com/images/icons/product/chrome-32.png";

        function renderGraph(response) {
            var width = 600,
                height = 600;

            var force = d3.layout.force()
                //.gravity(0.1)
                .charge(-360)
                .linkDistance(80)
                .size([width, height])
                .nodes(response.nodes)
                .links(response.links)
                .start();

            var drag = force.drag();
            //.on("dragstart", function() { d.fixed = true; });

            var graph = d3.select(".graph")
                .attr("width", 600)
                .attr("height", 600);

            graph.append("path")
                .attr("stroke", "black")
                .attr("stroke-width", "0")
                .attr("fill", "none")
                .attr("d", "M 0 0 L 0 " + height + " " + width + " " + height + " " + width + " 0 Z");

            graph.append("line")
                .attr("class", "edge");
                
            var link = graph.selectAll(".link")
                .data(response.links)
                .enter()
                .append("line")
                .attr("stroke", "gray")
                .attr("stroke-width", "2px");

            var node = graph.selectAll(".node")
                .data(response.nodes)
                .enter()
                .append("g");

            //node.append("circle")
            //    .attr("r", 8);


            node.append("image")
                .attr("xlink:href", function (d) { return d.favIconUrl || DEFAULT_FAVICON_URL; })
                .attr("x", -8)
                .attr("y", -8)
                .attr("width", 16)
                .attr("height", 16);

            function compress(str) {
                const MAX = 20;
                //if (str.length > 2 * MAX)
                //    return str.slice(0, MAX) + " ... " + str.slice(-MAX);
                if (str.length > MAX)
                    return str.slice(0, MAX) + " ...";
                else
                    return str;
            }

            node.append("a")
                //.attr("xlink:href", function (d) { return "http://" + d.url; })
                .attr("xlink:href", function (d) { return d.rawUrl; })
                .append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function (d) { return compress(d.title || d.url); });

            node.call(drag);

            force.on("tick", function () {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; })
                node
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
            });
        }

        // initial graph rendering
        renderGraph(response);
 
        // populate history results
        var historyItems = response.nodes;

        // create collection
        $("#page_list").append($("<div></div>")
            .attr("class", "collection")
            .attr("id", "history_collection"));

        var historyResults = $("#history_collection");

        if (historyItems.length == 0) {
            var item = $("<div></div>")
                .attr("class", "collection-item row valign-wrapper")
                .attr("id", "no_elements");

            item
                .append($("<span></span>").append("No history entries found."));

            historyResults
                .append(item);
        }
        else {
            
            //array is historyItems
            historyItems.forEach(function (value) {   
                var checkBoxId = value.pageIndex.toString();

                var item = $("<div></div>")
                    .attr("class", "collection-item row")
                    .attr("id", "collectionItem" + checkBoxId);
                    
                var columnContainer = $("<div></div>")
                    .attr("class", "col s12")
                    .attr("id", "itemContainer" + checkBoxId);

                var row = $("<div></div>")
                    .attr("class", "row valign-wrapper")
                    .attr("id", "basicInfo" + checkBoxId);

                row
                    .append($("<input></input>")
                    .attr("class", "cbox")
                    .attr("type", "checkbox")
                    .attr("id", checkBoxId));

                row
                    .append($("<img>")
                        .attr("class", "favicon")
                        .attr("src", value.favIconUrl || DEFAULT_FAVICON_URL));

                var pageLink = $("<span></span>")
                        .attr("id","linkContainer" + checkBoxId);
                        
                pageLink
                .append($("<a></a>")
                .attr("href", value.rawUrl)
                .text(value.title || value.rawUrl));

                row
                    .append(pageLink);

                var dropdownButton = $("<button></button>")
                        .attr("class", "red smallDropdown btn")
                        .attr("type", "button")
                        .attr("id", "dd" + checkBoxId);
                       

                        dropdownButton.append($("<img>")
                        .attr("src", "img/dropdown.png")
                        .attr("class", "pageDropdown"));
                        
                
                row.append(dropdownButton);
                columnContainer.append(row);
                

                item.append(columnContainer);

                historyResults
                    .append(item);
            });
        }

        //get array of existing sessions for activate session dropdown
        var currentSession = null;
        var dropdownList = null;
        chrome.runtime.sendMessage({ type: "GET_SESSIONS" }, function (response) {
            currentSession = response.currentSession;
            dropdownList = response.sessions;

            //populate dropdown
            var sessionDropdown = $("#session_dropdown");
            dropdownList.forEach(function (value, index) {
                sessionDropdown.append($("<option></option>")
                    .attr("value", value)
                    .attr("class", "dropdownOption")
                    .append(value));
                if (value == currentSession) {
                    sessionDropdown[0].selectedIndex = index;
                }
            });
        });

        function newSession() {
            var val = document.forms["add_session_form"]["new_session"].value;
            var sessionDropdown = $("#session_dropdown");
            console.log(val);
            if(!dropdownList.has(val)){
                dropdownList.push(val);
                sessionDropdown.append($("<option></option>")
                .attr("value", val)
                .attr("class", "dropdownOption")
                .append(val));
                chrome.runtime.sendMessage({
                    type: "ADD_SESSION",
                    sessionName: val
                });
                if (val == currentSession) {
                    sessionDropdown.selectedIndex = sessionDropdown.length - 1;
                }
            }
            
        };
        document.querySelector("#new_session_button").addEventListener('click', newSession);

        function activateSession() {
            var sessionList = $("#session_dropdown");
            chrome.runtime.sendMessage({
                type: "SWITCH_SESSION",
                sessionName: sessionList[sessionList.selectedIndex].value
            });
            // re-render graph
            //var oldGraph = document.querySelector("svg");
            //var graphContainer = oldGraph.parentNode;
            //graphContainer.removeChild(oldGraph);
            //var newGraph = document.createElement("svg");
            //graphContainer.appendChild(newGraph);
            //newGraph.className = "graph";
            //chrome.runtime.sendMessage({ type: "HISTORY_PAGE" }, function (response) {
            //    renderGraph(response);
            //});
        };
        document.querySelector("#activate_session_button").addEventListener('click', activateSession);
    
        //open other chrome pages
        var openExtensions = function () {
            chrome.tabs.create({ 'url': 'chrome://extensions', 'active': true });
        };
        document.querySelector("#extensions_link").addEventListener('click', openExtensions);

        var openSettings = function () {
            chrome.tabs.create({ 'url': 'chrome://settings', 'active': true });
        };
        document.querySelector("#settings_link").addEventListener('click', openSettings);

        var openAbout = function () {
            chrome.tabs.create({ 'url': 'chrome://help', 'active': true });
        };
        document.querySelector("#about_link").addEventListener('click', openAbout);

        //clear history as per user's specifications
        var clearSessions = function () {
            chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" });
            chrome.tabs.create({ 'url': 'chrome://settings/clearBrowserData', 'active': true });
        };
        document.querySelector("#clear_history_button").addEventListener('click', clearSessions);

        //remove selected pages from history
        var removePages = function () {
            var pageCollection = Array.prototype.slice.call(document.getElementById("history_collection").childNodes);

            pageCollection.forEach(function (value) {
                
                //checkbox is first element of collection item
                var checkedBox = value.childNodes[0];

                if (checkedBox.checked) {
                    chrome.runtime.sendMessage({
                        type: "REMOVE_LINK",
                        pageIndex: parseInt(checkedBox.id)
                    });
                }
            });
        };
        document.querySelector("#remove_selected_button").addEventListener('click', removePages);

        //toggle expanded information state of each page
        var expandedState = {};

        historyItems.forEach(function (value) {
            expandedState[value.pageIndex] = false;
        });

        //used for asynchronous calls
        function appendPreviewElements(pageUrl, callback) {
  
            $.get(pageUrl, function (data) {
                
                function passAfterInit(metaData) {
                    return $(metaData).filter("meta[content]");
                }
                //waiting meta data init
                callback(passAfterInit(data));
            })
            .fail(function () {
                console.log("Data could not be loaded.");
            });
        }

        function setExpandedState(pageIndex, callback) {
            expandedState[pageIndex] = !expandedState[pageIndex];
            callback(expandedState[pageIndex]);
        }
        function expandPageInfo(pageIndex, pageUrl) {
           
            setExpandedState(pageIndex, function (state) {

                var expandedDropdown = document.getElementById("expandedDropdown" + pageIndex);
                if (state == true && expandedDropdown === null) {
                    var expandedDropdownId = "expandedDropdown" + pageIndex;
                    var itemContainer = $("#itemContainer" + pageIndex);
                    var pageInfoContainer = $("<div></div>")
                        .attr("class", "row")
                        .attr("id", expandedDropdownId);

                    var pagePreview = $("<div></div>")
                        .attr("class", "card grey lighten-5 col s6")
                        .attr("id", "pagePreview" + pageIndex);

                    //render page statistics
                    var pageStats = $("<div></div>")
                        .attr("class", "card grey lighten-5 col s6")
                        .attr("id", "pageStats" + pageIndex)
                        .css("max-height", $("#pagePreview" + pageIndex).height());;

                    var pageTimes = $("<div></div>")
                        .attr("class", "card-content")
                        .append($("<div></div>")
                            .attr("class", "mobileViewTitle valign-wrapper")
                            .append($("<span></span>")
                            .attr("class", "card-title grey-text text-darken-5")
                            .append("Visits")));

                    var pageBackLinks = $("<div></div>")
                        .attr("class", "card-reveal");

                    var pageForwardLinks = $("<div></div>")
                        .attr("class", "card-reveal");

                    var pageContexts = $("<div></div>")
                        .attr("class", "card-reveal");

                    var pageSessions = $("<div></div>")
                        .attr("class", "card-reveal");

                    var getTimes = new Promise(
                            function (resolve, reject) {
                                var timeCollection = $("<ul></ul>")
                                    .attr("class", "collection timeList");
                                var timesAdded = false;
                                var expandedNode = $.grep(historyItems, function (item, index) {
                                    if (item.pageIndex == pageIndex) {
                                        return item;
                                    }
                                });

                                if (expandedNode != undefined) {
                                    chrome.history.getVisits({ url: pageUrl }, function (visits) {
                                        visits.forEach(function (visit, index) {
                                            var date = new Date(visit.visitTime);
                                            timeCollection.append($("<li></li>")
                                                .attr("class", "collection-item row valign-wrapper")
                                                .append($("<span><span>")
                                                    .append(date.toString())));
                                            if (index == visits.length - 1) {
                                                resolve(timeCollection);
                                            }
                                        })                   
                                    });
                                }
                                else {
                                    console.log("URL not found!");
                                }   
                                
                            });

                    getTimes.then(function (timeCollection) {
                        pageTimes.append(timeCollection);
                        pageStats.append(pageTimes);
                    });

                    var image = new Image();

                    image.id = "pagePreview" + pageIndex;
                    image.src = "img/frontier_icon_128.png"; //"http://www.snapit.io/snaps?url=" + pageUrl + "&max_width=400&max_height=300&fullpage=false";
                    
                    //initialize meta data here. Get meta elements as needed, missing assets may cause errors
                    
                    
                    //.get() throws errors if page assets do not specifiy protocol
                    appendPreviewElements(pageUrl, function (metaData) {
                        var getDescription;

                        if (metaData !== undefined) {

                            getDescription = new Promise(function (resolve, reject) {
                                    metaData.each(function (index) {
                                    if ($(this).prop("name") == "description" || $(this).prop("name") == "Description") {
                                        resolve($(this).prop("content"));
                                        return false;
                                    } else if ($(this).prop("name") == "twitter:description") {
                                        resolve($(this).prop("content"));
                                        return false;
                                    } else if ($(this).attr("property") == "og:description") {
                                        resolve($(this).prop("content"));
                                        return false;
                                    } else if (index == metaData.length - 1) {
                                        resolve("No Description Available...");
                                    }
                                    return true;
                                });
                            });
                        } else {
                            getDescription = new Promise(function (resolve, reject) {
                                resolve("No Description Available...");
                            });
                        }

                        getDescription.then(function (metaDescription) {
                            var pageLink = $("#linkContainer" + pageIndex).find("a");
                            pagePreview.append($("<div></div>")
                                .attr("class", "card-image")
                                    .append(image))
                                .append(
                                        $("<div></div>")
                                        .attr("class", "card-content")
                                        .append($("<h6></h6>")
                                            .append(UrlHostName($(pageLink).attr("href"))))
                                        .append($("<p></p>")
                                            .append(metaDescription))
                                )
                                .append($("<div></div>")
                                    .attr("class", "card-action")
                                    .append($("<a></a>")
                                        .attr("href", pageUrl)
                                        .append("Go to Page")));
      
                            pageInfoContainer.append(pagePreview);
                            pageInfoContainer.append(pageStats);
                            

                            itemContainer.append(pageInfoContainer);
                        });
                     
                    });
                   

                    //simulates fake click via jQuery
                    //$("#dd" + pageIndex).click();
                } else if (state == false && expandedDropdown !== null) {
                    $("#expandedDropdown" + pageIndex).remove();
                }
            });
            
        }

        historyItems.forEach(function (value) {

            //closure
            (function () {
                var dropdownId = "#dd" + value.pageIndex.toString();
                document.querySelector(dropdownId).addEventListener('click', function () { expandPageInfo(value.pageIndex.toString(), value.rawUrl); }, false);
            }())

        });



     
        


    });

}()));
