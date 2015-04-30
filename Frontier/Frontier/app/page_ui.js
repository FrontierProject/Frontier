    $(document).ready((function (){
    
        // Clicking on the frontier logo shows the banner, but it needs the URL
        chrome.runtime.onMessage.addListener(function (request, sender, SendResponse) {
            if (request.action == "GET_URL") {
                SendResponse({url: document.URL});
            }
        });
        
    }()));
