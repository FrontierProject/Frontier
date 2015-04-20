chrome.runtime.sendMessage({type: "HISTORY_PAGE"}, function(response) {
    //var pre = document.getElementById("links");
    //pre.textContent = JSON.stringify(response.links, null, 2);

var width = 800,
    height = 800;

var graph = d3.select(".graph")
    .attr("width", width)
    .attr("height", height);

var link = graph.selectAll(".link")
    .data(response.links)
    .enter()
    .append("line");

var node = graph.selectAll(".node")
    .data(response.nodes)
    .enter()
    .append("g");

node.append("circle")
    .attr("r", 8);

node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.title || d.url; });

var force = d3.layout.force()
    .charge(-360)
    .linkDistance(60)
    .size([width, height])
    .nodes(response.nodes)
    .links(response.links)
    .start();

force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
  node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
});

});
