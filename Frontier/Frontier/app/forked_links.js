//<![CDATA[ 
$(window).load(function(){
$(document).ready((function (){
   
    
        //$ indicates selector
        var $list = $("#list_container #url_list");
        var $listItems = $("#list_container #url_list .list_item");
        var tmplt = "<li class=\"list_item\"><p>{{url}}</p></li>";
    
        //dynamically populates the list and animates
        function updateList ( urls ) {
            $list.html($.map( urls, function ( url ) {
                return tmplt.replace( /{{url}}/, url );
            }).join(""));
        }
        function showList(){
            //showList
            $list.fadeIn(1000);
            $("li").animate({
                'border-width' : '+=1px',
                'padding' : '+=10px'
            });

            //hideList after extending
            $("li").animate({
                'margin-right' : '-=250px'
            }, 500).delay( 5000 );   
            
            $("li").fadeOut(500);
            
            
        }
        function highlightOption(){
            $("li").mouseenter(
                function(){
                    $(this).css({
                        'margin-right' : '5px'
                    });
                }
            );
            $("li").mouseleave(
                function(){
                    $(this).css({
                        'margin-right' : '10px'
                    });
                }
            );
        }
    
        //fades the list into view
        $list.hide(500);
        updateList(["thing 1", "thing 2", "thing 3", "thing 4"]);
        showList();
        highlightOption();
    
    }()));
});//]]>
