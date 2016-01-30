'use strict';

weatherApp.factory('notifyService', ['$timeout', function ($timeout) {

    /*******************************************************************************
    This service simply provides feedback to the user in the event of an error, or
    when we need to display the loader for running processes.
    *******************************************************************************/


    /*******************************************************************************************************************
    <summary> Displays a message dialog with a red background </summary>
    <param> {string} msg: A string value containing the message to display </param>
    *******************************************************************************************************************/
    var _errorDialog = function (msg) {        
        _closeDialogs();                // Close all dialogs
        $('#msg-dialog  p').text(msg);
        $('#msg-dialog').addClass('error-dialog').popup('open');       
        _setDialogTimeout();            // Close dialog after a specific length of time
    };


    /*******************************************************************************************************************
    <summary> Displays a message dialog with a non-red background </summary>
    <param> {string} msg: A string value containing the message to display </param>
    *******************************************************************************************************************/
    var _infoDialog = function (msg) {
        _closeDialogs();                // Close all dialogs
        $('#msg-dialog  p').text(msg);
        $('#msg-dialog').addClass('info-dialog').popup('open');
        _setDialogTimeout();            // Close dialog after a specific length of time
    };


    /*******************************************************************************************************************
    <summary> Auomatically closes any dialogs that are opened after a set amount of time </summary>
    *******************************************************************************************************************/
    var _setDialogTimeout = function () {        
        $timeout(function () { $('#msg-dialog').popup('close').removeClass('info-dialog'); }, 5000);
    };


    /*******************************************************************************************************************
    <summary> Closes any opened dialog </summary>
    *******************************************************************************************************************/
    var _closeDialogs = function () {
        $('.dialog').popup('close').removeClass('error-dialog info-dialog');
        _hideLoader();
    };


    /*******************************************************************************************************************
    <summary> Displays the ajax-loader dialog when the system is running a process </summary>
    *******************************************************************************************************************/
    var _displayLoader = function () {
        var $this = $(document),
            theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
            msgText = $this.jqmData("msgtext") || $.mobile.loader.prototype.options.text,
            textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible,
            textonly = !!$this.jqmData("textonly"),
            html = $this.jqmData("html") || "";

        // Overlay the html element with the loader image
        $.mobile.loading("show", {
            text: 'Connecting',
            textVisible: true,
            theme: theme,
            textonly: false,
            html: html
        });
    };


    /*******************************************************************************************************************
    <summary> Closes the ajax-loader dialog </summary>
    *******************************************************************************************************************/
    var _hideLoader = function () { $.mobile.loading("hide"); };



    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var notifyService = {};
    notifyService.displayErrorDialog = _errorDialog;
    notifyService.displayInfoDialog = _infoDialog;
    notifyService.displayLoaderDialog = _displayLoader;
    notifyService.hideLoaderDialog = _hideLoader;
    return notifyService;
}]);
