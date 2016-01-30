'use strict';

weatherApp.factory('geoLocationService', ['$q', '$window', 'deviceService', 'mapService', function ($q, $window, deviceService, mapService) {

    /*******************************************************************************
     This service retrieves the latitude & longitude coordinates from the device's
     Geo-Location service. 
    *******************************************************************************/

    /*******************************************************************************************************************
    <summary> Attempts to retrieves the latitude & longitude coordinates for current device position </summary>
    <returns> {promise} A location object if coords were retrieved, otherwise an error message {string} </returns>
    *******************************************************************************************************************/
    var _getDeviceCoordinates = function () {
        var deferred = $q.defer();        
        deviceService.geoLocationServiceAvailable().then(           // Check if the device's geolocation service is available
            function (success) {
                $window.navigator.geolocation.getCurrentPosition(                    
                    function (position) {                           // Successfully acquired latitude & longitude
                        var _location = { name: '', countryCode: '', latitude: position.coords.latitude, longitude: position.coords.longitude };
                        mapService.resolveAddress(_location).then(  // Try to resolve the location name & country code
                            function (_location) {
                                deferred.resolve(_location);
                            },
                            function (error) { deferred.reject(error); }
                        );
                    },
                    function (error) { deferred.reject(_createReadableErrorMessage(error)); }, // Failed to acquired geo-coordinates
                    { enableHighAccuracy: true, timeout: 5000 }     // Allow 5 seconds to connect
                );
            },            
            function (error) { deferred.reject(error); }            // Geolocation service not available
        );
        return deferred.promise;
    };

    /*******************************************************************************************************************
    <summary> Creates a understandable error message </summary>
    <returns> {string} An error message </returns>
    *******************************************************************************************************************/
    var _createReadableErrorMessage = function (error) {
        var errorMsg = 'Please allow geolocation access for this to work.';
        switch (error.code) {
            case error.TIMEOUT:
                errorMsg = "A timeout occured, Please try again!";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMsg = 'Cannot detect your location. Sorry!';
                break;
            case error.PERMISSION_DENIED:
                errorMsg = 'Please allow geolocation access for this to work.';
                break;
            case error.UNKNOWN_ERROR:
                errorMsg = 'An unknown error occured!';
                break;
        }
        return errorMsg;
    };

    
    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var geoLocationService = {};
    geoLocationService.getCurrentLocation = _getDeviceCoordinates;
    return geoLocationService;
}]);
