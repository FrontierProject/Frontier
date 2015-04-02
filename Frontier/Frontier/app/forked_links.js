//<![CDATA[ 
$(window).load(function(){
$(document).ready((function (){
   
    //Tested code here: http://jsfiddle.net/mvCUH/198/
    
        //$ indicates selector
        // var $forwardList = $("#forward_list_container #url_list");
        // var $backList = $("#forward_list_container #url_list");
        // var $listItems = $("#forward_list_container #back_list_contrainer #url_list .list_item");
        var tmplt = "<li class=\"list_item\"><p>{{url}}</p></li>";
        
        // var imports = "<link rel=\"stylesheet\" type=\"text/css\" href=\"forked_links.css\" /><script src=\"jquery-2.1.3.min.js\"></script><script src=\"forked_links.js\"></script>";
        var forwardData = "";
        var backData = "";

        //functions
        //dynamically populates the list and animates
        function updateList(backLinks, forwardLinks) {
            // $("head").append(imports);
            
            // Only display when there is a fork
            if (backLinks.length > 1)
            {
                var backMenu = $.map(backLinks, function (backLink) {
                   return tmplt.replace(/{{url}}/, backLink);
                }).join("");

                backData = "<div id=\"back_list_container\"><ul style=\"list-style-type:none;\" id=\"back_url_list\">" + backMenu + "</ul></div>";
                $("body").append(backData);
            }
            
            // Only display when there is a fork
            if (forwardLinks.length > 1)
            {
                var forwardMenu = $.map(forwardLinks, function (forwardLink) {
                    return tmplt.replace(/{{url}}/, forwardLink);
                }).join("");

                forwardData = "<div id=\"forward_list_container\"><ul style=\"list-style-type:none;\" id=\"forward_url_list\">" + forwardMenu + "</ul></div>";
                $("body").append(forwardData);
            }
        }
        
        // function showList() {
            // //showList
            // $list.fadeIn(1000);
            // //hideList after extending
            // $(".list_item").animate({
                // 'margin-right': '-=250px'
            // }, 800).delay(5000);
            // //$(".list_item").fadeOut(500);
        // }
        // function highlightOption() {
            // $(".list_item").mouseenter(
                // function () {
                    // $(this).css({
                        // 'margin-right': '5px'
                    // });
                // }
            // );
            // $(".list_item").mouseleave(
                // function () {
                    // $(this).css({
                        // 'margin-right': '10px'
                    // });
                // }
            // );
        // }

        


        //fades the list into view
       // $list.hide(1000);
        
        chrome.runtime.sendMessage({
            type: "FORKED_LINKS",
            url: document.URL
        }, function (response) {
            updateList(response.backLinks, response.forwardLinks);
        });

        // showList();
        // highlightOption();

    }()));
});//]]>
