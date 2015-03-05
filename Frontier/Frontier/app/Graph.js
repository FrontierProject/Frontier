FRONTIER.Graph = function() {

    this.nodes = [];
    this.links = [];

};

FRONTIER.Graph.prototype = {

    addEdge: function() {
        var discovered = new Set();

        return function(source, target) {
            if (!discovered.has(source.url)) {
                discovered.add(source.url);
                this.nodes.push(source);
            }

            if (!discovered.has(target.url)) {
                discovered.add(target.url);
                this.nodes.push(target);
            }

            this.links.push({source: source, target: target });
        };
    }(),

};
