$(document).ready((function (){
   
    "use strict";
    
    var $list = $("#list_container .url_list");
    var tmplt = "<li><h3>{{url}}</h3></li>";
    
    
    
    function updateList ( urls ) {
        $list.html($.map( urls, function ( url ) {
            return tmplt.replace( /{{url}}/, url );
        }).join(""));
    }
    
    updateList( ["yahoo.com", "Richard", "Kendra", "Jake"]);
 
    
}()));