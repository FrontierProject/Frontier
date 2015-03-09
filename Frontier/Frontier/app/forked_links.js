//<![CDATA[ 
$(window).load(function(){
$(document).ready((function (){
   
    //Tested code here: http://jsfiddle.net/mvCUH/198/
    
        //$ indicates selector
        var $list = $("#list_container #url_list");
        var $listItems = $("#list_container #url_list .list_item");
        var tmplt = "<li class=\"list_item\"><p>{{url}}</p></li>";
        
        var imports = "<link rel=\"stylesheet\" type=\"text/css\" href=\"forked_links.css\" /><script src=\"jquery-2.1.3.min.js\"></script><script src=\"forked_links.js\"></script>";
        var data = "";

        //dynamically populates the list and animates
        function updateList(urls) {
            $("head").append(imports);
            
            var menu = $.map(urls, function (url) {
                return tmplt.replace(/{{url}}/, url);
            }).join("");

            data = "<div id=\"list_container\"><ul style=\"list-style-type:none;\" id=\"url_list\">" + menu + "</ul></div>";
            $("body").append(data);
        }
        function showList() {
            //showList
            $list.fadeIn(1000);
            //hideList after extending
            $(".list_item").animate({
                'margin-right': '-=250px'
            }, 800).delay(5000);
            //$(".list_item").fadeOut(500);
        }
        function highlightOption() {
            $(".list_item").mouseenter(
                function () {
                    $(this).css({
                        'margin-right': '5px'
                    });
                }
            );
            $(".list_item").mouseleave(
                function () {
                    $(this).css({
                        'margin-right': '10px'
                    });
                }
            );
        }

        //fades the list into view
        $list.hide(1000);
        updateList(["thing 1", "thing 2", "thing 3", "thing 4"]);
        showList();
        highlightOption();

    }()));
});//]]>
