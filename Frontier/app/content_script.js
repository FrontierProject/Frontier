chrome.runtime.sendMessage({
    type:   "ADD_LINK",
    source: document.referrer,
    target: document.URL,
    title:  document.title
});