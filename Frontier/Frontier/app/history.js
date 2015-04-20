chrome.runtime.sendMessage({ type: "HISTORY_PAGE" }, function (response) {
    //var pre = document.getElementById("links");
    //pre.textContent = JSON.stringify(response.links, null, 2);

    
    var width = 1268,
        height = 900;

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
        .attr("width", "100%")
        .attr("height", "100px");

    graph.append("path")
        .attr("stroke", "black")
        .attr("stroke-width", "5")
        .attr("stroke-dasharray", "5,5")
        .attr("fill", "none")
        .attr("d", "M0 0 L0 " + height + " " + width + " " + height + " " + width + " 0 Z")

    var link = graph.selectAll(".link")
        .data(response.links)
        .enter()
        .append("line");

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

});