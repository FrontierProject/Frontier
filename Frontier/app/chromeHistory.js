FRONTIER.ChromeHistory = function() {

  this.historyItems = {};
  this.visitItems = {};

  var that = this;

  function addVisitItem(visitItem) {
    that.visitItems[visitItem.id] = visitItem;
  }

  function addVisitItems(visitItems) {
    _.map(visitItems, addVisitItem);
  }

  function addHistoryItem(historyItem) {
    that.historyItems[historyItem.id] = historyItem;

    var query = {
      "url": historyItem.url
    };

    // add VisitItems associated with historyItem.url to ChromeHistory
    chrome.history.getVisits(query, addVisitItems);
  }

  function addHistoryItems(historyItems) {
    var historyItemsWithUrl = _.filter(historyItems, "url");

    _.map(historyItemsWithUrl, addHistoryItem);
  }

  var query = {
    "text": ""
  };

  // add all HistoryItems to ChromeHistory
  chrome.history.search(query, addHistoryItems);

  this.nodes = {};
  this.rootNodes = {};

  function addNodes(visitId) {
    var referringVisitId = that.getReferringVisitId(visitId);

    if (_.has(that.visitItems, referringVisitId))
      that.addLink(referringVisitId, visitId);
    else
      that.addRootNode(visitId);
  }

  _.map(this.visitItems, addNodes);

}

FRONTIER.ChromeHistory.prototype = {

  getVisitUrl: function(visitId) {
    var id = this.visitItems[visitId].id;

    return this.historyItems[id].url;
  },

  getReferringVisitId: function(visitId) {
    return this.visitItems[visitId].referringVisitId;
  },

  getNode: function(visitId) {
    if (_.has(this.nodes, visitId))
      return this.nodes[visitId];

    return this.nodes[visitId] = {
      "name": this.getVisitUrl(visitId),
      "children": []
    };
  },

  addLink: function(referringVisitId, visitId) {
    this.getNode(referringVisitId)
        .children
        .push(this.getNode(visitId));
  },

  addRootNode: function(visitId) {
    this.rootNodes[visitId] = this.getNode(visitId);
  },

};
