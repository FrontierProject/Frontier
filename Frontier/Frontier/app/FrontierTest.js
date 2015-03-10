/// <reference path="Frontier.js" />
/// <reference path="Graph.js" />

QUnit.module("Graph Test", {
	setup: function() {
		this.frontierGraph = new FRONTIER.Graph();
	}
});

QUnit.test("Graph initialization should have no nodes or links", function(assert) {
    assert.equal(this.frontierGraph.nodes.length, 0, "Graph starts with no nodes");
    assert.equal(this.frontierGraph.links.length, 0, "Graph starts with no links");
});

QUnit.test("addEdge should add two new nodes and one new link", function(assert) {
	// These all need to be DIFFERENT (unique) with respect to other tests
	var source = {url: "source"};
	var target = {url: "target"};
	
	this.frontierGraph.addEdge(source, target);
	
	console.log(this.frontierGraph);
	
    assert.equal(this.frontierGraph.nodes.length, 2, "Graph has two nodes");
    assert.equal(this.frontierGraph.links.length, 1, "Graph has one link");
});

QUnit.test("addEdge should not add node if already in graph", function(assert) {
	// These all need to be DIFFERENT (unique) with respect to other tests
	var source1 = {url: "source1"};
	var source2 = {url: "source2"};
	var target = {url: "target"};
	
	this.frontierGraph.addEdge(source1, target);
	this.frontierGraph.addEdge(source2, target);
	
	console.log(this.frontierGraph);
	
    assert.equal(this.frontierGraph.nodes.length, 3, "Graph has three nodes");
    assert.equal(this.frontierGraph.links.length, 2, "Graph has two links");
	
	
});
