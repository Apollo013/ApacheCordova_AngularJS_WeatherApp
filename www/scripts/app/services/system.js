'use strict';

weatherApp.factory('systemService', ['$rootScope', '$window', function ($rootScope, $window) {

    /*******************************************************************************
     SYSTEM SETUP
    *******************************************************************************/


    /*******************************************************************************************************************
    <summary> Initialize the system </summary>
    *******************************************************************************************************************/
    var _initialize = function () {  document.addEventListener('deviceready', _onDeviceReady, false); };


    /*******************************************************************************************************************
    <summary> 'deviceready' event handler </summary>
    *******************************************************************************************************************/
    var _onDeviceReady = function () {

        $rootScope.ready = false;

        // Register Cordova 'pause' and 'resume' event handlers
        document.addEventListener('pause', _onPause, false);
        document.addEventListener('resume', _onResume, false);        

        // Handle 'swipe' events
        $(document).on("swipeleft swiperight", "#home-page", function (e) { _onSwipe(e)});
        
        // Initialize popup dialog
        $('#msg-dialog').popup();

        // Resize elements to fit screen size
        _structureLayout();

        // This will trigger the system to go get weather details (see: weather controller)
        $rootScope.ready = true;
    };


    /*******************************************************************************************************************
    <summary> 'pause' event handler </summary>
    *******************************************************************************************************************/
    var _onPause = function () { };


    /*******************************************************************************************************************
    <summary> 'resume' event handler </summary>
    *******************************************************************************************************************/
    var _onResume = function () { };


    /*******************************************************************************************************************
    <summary> left & right 'swipe' event handler </summary>
    *******************************************************************************************************************/
    var _onSwipe = function (e) {
        // We'll make sure there is no open panel on the page, otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($(".ui-page-active").jqmData("panel") !== "open") {
            if (e.type === "swipeleft") {
                $("#right-panel").panel("open");
            }
            else if (e.type === "swiperight") {
                $("#left-panel").panel("open");
            }
        }
    };


    /*******************************************************************************************************************
    <summary> Makes asjustments to some element styles to fit phone dimensions </summary>
    *******************************************************************************************************************/
    var _structureLayout = function () {
        // Grab heights of static elements
        var winWidth = $window.outerWidth;
        var winHeight = $window.outerHeight;
        var headerHeight = $('#main-header').height();
        var footerHeight = $('#main-footer').height();
        var mainDisplayHeight = $('#main-display').height();
        var optionsHeight = $('#list-options').height();
        var settingsHeight = $('#settings').height();
        var mapHeaderHeight = $('#right-header').height();

        // Calculate new list heights
        var listHeight = winHeight - (headerHeight + footerHeight + mainDisplayHeight + optionsHeight + 8); // 7 = border widths

        // Apply list + map heights
        $('.list').height(listHeight).css({ 'max-height': listHeight });
        $('#location-list').height(winHeight - settingsHeight).css({ 'max-height': winHeight - settingsHeight });
        $('#map').height(winHeight - mapHeaderHeight).css({ 'max-height': winHeight - mapHeaderHeight });

        $('#search-container .ui-block-b').width(winWidth - 104);
    };


    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var systemService = {};
    systemService.initialize = _initialize;
    return systemService;
}]);
