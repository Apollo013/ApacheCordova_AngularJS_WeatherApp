'use strict';

weatherApp.factory('locationsStorageService', ['$q', '$window', 'deviceService', function ($q, $window, deviceService) {

    /*******************************************************************************
    This service is responsible for persisting and retrieving locations to / from
    local storage.
    *******************************************************************************/


    /*******************************************************************************
     VARIABLES & CONSTANTS
    *******************************************************************************/    
    var LOCATION_LOCAL_STORAGE_KEY = 'weatherlocationzzs',
        tempLocations = [   { name: 'London', countryCode: 'GB', latitude: '51.51', longitude: '-0.13' },
                            { name: 'Dublin', countryCode: 'IE', latitude: '53.33', longitude: '-6.29' },
                            { name: 'Paris', countryCode: 'FR', latitude: '48.86', longitude: '2.34' },
                            { name: 'Milan', countryCode: 'IT', latitude: '45.48', longitude: '9.18' },
                            { name: 'Barcelona', countryCode: 'ES', latitude: '41.4', longitude: '2.15' },
                            { name: 'Madrid', countryCode: 'ES', latitude: '40.42', longitude: '-3.67' },
                            { name: 'Rome', countryCode: 'IT', latitude: '41.9', longitude: '12.5' },
                            { name: 'Berlin', countryCode: 'DE', latitude: '52.52', longitude: '13.38' } ];


    /*******************************************************************************************************************
    <summary> Attempts to load all locations from local storage </summary>
    <returns> {array} All locations in storage or a default list of locations </returns>
    *******************************************************************************************************************/
    var _loadFromStorage = function () {
        return angular.fromJson($window.localStorage.getItem(LOCATION_LOCAL_STORAGE_KEY)) || tempLocations;
    };


    /*******************************************************************************************************************
    <summary> Saves ALL locations to local storage </summary>
    <param> {array} locations: An array containing all locations </param>
    *******************************************************************************************************************/
    var _saveToStorage = function (_locations) { $window.localStorage.setItem(LOCATION_LOCAL_STORAGE_KEY, angular.toJson(_locations)); };


    /*******************************************************************************************************************
    <summary> Retrieves all locations from local storage </summary>
    <returns> {array} All locations in local storage or a default list of locations </returns>
    *******************************************************************************************************************/
    var _query = function () {
        var deferred = $q.defer();
        deviceService.LocalStorageServiceAvailable().then(              // Check for local storage
            function (success) { deferred.resolve(_loadFromStorage()); },
            function (error) { deferred.resolve(tempLocations); }
        );
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Saves a location (new or existing) to local storage </summary>
    <param> {Object} _location: The location object to save </param>
    <returns> {promise} All locations if the location was saved successfully, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _save = function (_location) {
        // First we will attempt to update this location (to prevent duplicates). If update fails, we will save it as a new location.
        var deferred = $q.defer();
        deviceService.LocalStorageServiceAvailable().then(              // Check for local storage
            function (success) {
                _update(_location).then(
                    function (locations) { deferred.resolve(locations); },  // Update succeeded                
                    function (error) {                                  // Update failed, therefore it does not already exist.
                        _create(_location).then(
                            function (locations) { deferred.resolve(locations); },
                            function (error) { deferred.reject('Location could not be saved'); }
                        );
                    }
                );
            },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Saves a new location to local storage </summary>
    <param> {Object} _location: The location object to save </param>
    <returns> {promise} An array of all locations in storage </returns>
    *******************************************************************************************************************/
    var _create = function (_location) {
        var deferred = $q.defer();        
        var locations = _loadFromStorage();
        locations.push(_location);      // Add new location        
        _saveToStorage(locations);      // Save all to local storage
        deferred.resolve(locations);
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Updates an existing location in local storage </summary>
    <param> {Object} _location: The location object to update </param>
    <returns> {promise} All locations if the location was updated successfully, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _update = function (_location) {
        var deferred = $q.defer();
        var updated = false;
        deviceService.LocalStorageServiceAvailable().then(  // Check for local storage
            function (success) {                
                var locations = _loadFromStorage();         // Iterate through all locations, find a match and update it.
                for (var i = 0 ; i < locations.length ; i++) {
                    if (locations[i].city == _location.city && locations[i].countryCode == _location.countryCode) {
                        locations[i].latitude = _location.latitude;
                        locations[i].longitude = _location.longitude;
                        updated = true;
                        break;
                    }
                };
                if (updated) {
                    _saveToStorage(locations);              // Save all to local storage
                    deferred.resolve(locations);
                }
                else { deferred.reject('Location could not be updated'); };
            },
            function (error) { deferred.reject(error); }
        );        
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Removes an existing location from local storage </summary>
    <param> {Object} _location: The location object to remove </param>
    <returns> {promise} An array of all locations in storage, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _delete = function (_location) {
        var deferred = $q.defer();
        var deleted = false;
        deviceService.LocalStorageServiceAvailable().then(  // Check for local storage
            function (success) {
                var locations = _loadFromStorage();         // Iterate through all locations, find a match & remove it.
                for (var i = 0 ; i < locations.length ; i++) {
                    if (locations[i].name == _location.name && locations[i].countryCode == _location.countryCode) {
                        locations.splice(i, 1);
                        deleted = true;
                        break;
                    }
                };
                if (deleted) {
                    _saveToStorage(locations);              // Save all to local storage
                    deferred.resolve(locations);
                }
                else { deferred.reject('Location could not be removed'); };
            },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };


    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var locationsStorageService = {};
    locationsStorageService.query  = _query;
    locationsStorageService.save = _save;
    locationsStorageService.delete = _delete;
    return locationsStorageService;
}]);
