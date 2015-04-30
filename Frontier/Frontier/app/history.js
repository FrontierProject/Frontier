$(document).ready((function () {
    chrome.runtime.sendMessage({ type: "HISTORY_PAGE" }, function (response) {
        //var pre = document.getElementById("links");
        //pre.textContent = JSON.stringify(response.links, null, 2);
    
    
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

        const DEFAULT_FAVICON_URL = "http://www.google.com/images/icons/product/chrome-32.png";

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

        var newSession = function () {
            var txt = document.querySelector("#new_session_textbox");
            return function () {
                var val = txt.value;
                chrome.runtime.sendMessage({
                    type: "ADD_SESSION",
                    sessionName: val
                });
            };
        }();
        document.querySelector("#new_session_button").addEventListener('click', newSession);

        var activateSession = function () {
            var option_selected = document.querySelector("#session_dropdown");
            return function () {
                var val = option_selected.lastChild;
                chrome.runtime.sendMessage({
                    type: "SWITCH_SESSION",
                    sessionName: val
                });
            };
        }();
        document.querySelector("#activate_session_button").addEventListener('click', activateSession);

        var openExtensions = function () {
            return function () {
                chrome.tabs.create({ 'url': 'chrome://extensions', 'active': true });
            };
        }();
        document.querySelector("#extensions_item").addEventListener('click', openExtensions);

        var openSettings = function () {
            return function () {
                chrome.tabs.create({ 'url': 'chrome://settings', 'active': true });
            };
        }();
        document.querySelector("#settings_item").addEventListener('click', openSettings);

        var openAbout = function () {
            return function () {
                chrome.tabs.create({ 'url': 'chrome://help', 'active': true });
            };
        }();
        document.querySelector("#about_item").addEventListener('click', openExtensions);


        /*
        $("#history_item").click(function () {
            chrome.runtime.sendMessage({
                type: "OPEN_HISTORY"
            });
        });
        $("#extension_item").click(function () {
            chrome.runtime.sendMessage({
                type: "OPEN_EXTENSIONS"
            });
        });
        $("#settings_item").click(function () {
            chrome.runtime.sendMessage({
                type: "OPEN_SETTINGS"
            });
        });
        $("#about_item").click(function () {
            chrome.runtime.sendMessage({
                type: "OPEN_ABOUT"
            });
        });*/
    

    });

}()));
