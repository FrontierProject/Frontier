FRONTIER.Graph = function() {

    this.nodes = [];
    this.links = [];
	this.discovered = new Set();
};

FRONTIER.Graph.prototype = {

    addEdge: function() {
        return function(source, target) {
            if (!this.discovered.has(source.url)) {
                this.discovered.add(source.url);
                this.nodes.push(source);
            }

            if (!this.discovered.has(target.url)) {
                this.discovered.add(target.url);
                this.nodes.push(target);
            }

            this.links.push({source: source, target: target });
        };
    }(),

};
