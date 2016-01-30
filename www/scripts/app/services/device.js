'use strict';

weatherApp.factory('deviceService', ['$q', '$window', function ($q, $window) {

    /*******************************************************************************
    This service checks to see if we have access to the necessary device facilities.
    *******************************************************************************/

    /*******************************************************************************************************************
    <summary> Determines if the device has access to the network service </summary>
    <returns> {promise} 'true' if the device has access to the network service, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _hasNetworkAccess = function () {
        var deferred = $q.defer();
        var networkState = navigator.connection.type;
        var states = {};

        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        if (networkState != Connection.NONE) {
            deferred.resolve(true);
        }
        else {
            deferred.reject(states[Connection.NONE]);
        }
        return deferred.promise;
    };
    

    /*******************************************************************************************************************
    <summary> Determines if the device has access to the geo-location service </summary>
    <returns> {promise} true if the device has access to the geolocation service, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _hasGeoLocationAccess = function () {
        var deferred = $q.defer();
        if (navigator.geolocation) {
            deferred.resolve(true);
        }
        else {
            deferred.reject("Please allow geolocation access for this to work.");
        }
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Determines if the device has access to local storage </summary>
    <returns> {promise} true if the device has access to local storage, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _hasLocalStorageAccess = function () {
        var deferred = $q.defer();
        if (angular.isDefined($window.localStorage)) {
            deferred.resolve(true);
        }
        else {
            deferred.reject("Local Storage not available");
        };
        return deferred.promise;
    }


    /*******************************************************************************************************************
    <summary> Determines if the device has access to all necessary device services </summary>
    <returns> {promise} true if the device has access to all device services, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _isReady = function () {
        var deferred = $q.defer();
        // Check network connection
        _hasNetworkAccess().then(
            function (success) {
                // Check GeoLocation Service
                _hasGeoLocationAccess().then(
                    function (success) {
                        // Check local storage
                        _hasLocalStorageAccess().then(
                            function (success) {
                                // Only resolve when all 3 pass
                                deferred.resolve(success);
                            },
                            function (error) { deferred.reject(error); }
                        );
                    },
                    function (error) { deferred.reject(error); }
                );
            },
            function (error) {  deferred.reject(error); }
        );
        return deferred.promise;
    };


    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var deviceService = {};
    deviceService.networkServiceAvailable = _hasNetworkAccess;
    deviceService.geoLocationServiceAvailable = _hasGeoLocationAccess;
    deviceService.LocalStorageServiceAvailable = _hasLocalStorageAccess;
    deviceService.isReady = _isReady;
    return deviceService;
}]);
