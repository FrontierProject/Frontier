Array.prototype.has = function(value) {
    var setObj = new Set(this);
    return setObj.has(value);
};

$(document).ready((function () {
    chrome.runtime.sendMessage({ type: "HISTORY_PAGE" }, function (response) {

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
                var item = $("<div></div>")
                    .attr("class", "collection-item row valign-wrapper");
                
                console.log(value);

                var checkBoxId = value.pageIndex.toString();
                
                item
                    .append($("<input></input>")
                    .attr("class", "cbox")
                    .attr("type", "checkbox")
                    .attr("id", checkBoxId));

                item
                    .append($("<img>")
                        .attr("class", "favicon")
                        .attr("src", value.favIconUrl || DEFAULT_FAVICON_URL));

                item
                    .append($("<span></span>").append($("<a></a>")
                        .attr("href", value.rawUrl)
                        .text(value.title || value.rawUrl)));

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
            var sessionList = $("#session_list");
            dropdownList.forEach(function (value, index) {
                sessionList.append($("<option></option>")
                    .attr("value", value)
                    .text(value));
                if (value == currentSession) {
                    sessionList[0].selectedIndex = index;
                }
            });
        });

        function newSession() {
            var val = document.forms["add_session_form"]["new_session"].value;
            var sessionList = $("#session_list");
            console.log(val);
            if(!dropdownList.has(val)){
                dropdownList.push(val);
                sessionList.append($("<option></option>")
                .attr("value", val)
                .text(val.toString()));
                chrome.runtime.sendMessage({
                    type: "ADD_SESSION",
                    sessionName: val
                });
                if (value == currentSession) {
                    sessionList[0].selectedIndex = index;
                }
            }
            
        };
        document.querySelector("#new_session_button").addEventListener('click', newSession);

        function activateSession() {
            var sessionList = $("#session_list")[0];
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
    
    
        var openExtensions = function () {
            chrome.tabs.create({ 'url': 'chrome://extensions', 'active': true });
        };
        document.querySelector("#extensions_item").addEventListener('click', openExtensions);

        var openSettings = function () {
            chrome.tabs.create({ 'url': 'chrome://settings', 'active': true });
        };
        document.querySelector("#settings_item").addEventListener('click', openSettings);

        var openAbout = function () {
            chrome.tabs.create({ 'url': 'chrome://help', 'active': true });
        };
        document.querySelector("#about_item").addEventListener('click', openExtensions);

        var clearSessions = function () {
            chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" });
            chrome.tabs.create({ 'url': 'chrome://settings/clearBrowserData', 'active': true });
        };
        document.querySelector("#clear_history_button").addEventListener('click', clearSessions);


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


    });

}()));
