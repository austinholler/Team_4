// Edit History
// Date    Author   Description
// =================================================
// 3/22    MB       Default javascript for app
// 4/2     MB       Initialize WOW.js

$(document).ready(function(){
    $('.collapsible').collapsible({
        accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
    new WOW().init();
});
