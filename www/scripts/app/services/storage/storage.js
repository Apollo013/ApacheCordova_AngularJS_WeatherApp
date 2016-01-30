'use strict';

weatherApp.factory('storageService', ['$q', 'locationsStorageService', 'settingsStorageService', function ($q, locationsStorageService, settingsStorageService) {

    /*******************************************************************************
    This service will act as an intermediary between the weather contoller + other
    services, and the location & settings storage services. This is done simply from 
    a seperation of concerns perspective.
    *******************************************************************************/


    /*******************************************************************************
     LOCATIONS
    *******************************************************************************/
    /*******************************************************************************************************************
    <summary> Retrieves all locations from local storage </summary>
    <returns> {array} All locations in storage or a default list of locations </returns>
    *******************************************************************************************************************/
    var _queryLocations = function () {
        var deferred = $q.defer();
        locationsStorageService.query().then(
            function (locations) { deferred.resolve(locations); },
            function (locations) { deferred.resolve(locations); } // Default locations
        );
        return deferred.promise;
    };

    /*******************************************************************************************************************
    <summary> Saves a location (new or existing) to local storage </summary>
    <param> {Object} _location: The location object to save </param>
    <returns> {promise} All locations if the location was saved successfully, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _saveLocation = function (_location) {
        var deferred = $q.defer();
        locationsStorageService.save(_location).then(
            function (locations) { deferred.resolve(locations); },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };

    /*******************************************************************************************************************
    <summary> Removes an existing location from local storage </summary>
    <param> {Object} _location: The location object to remove </param>
    <returns> {promise} An array of all locations in storage, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _deleteLocation = function (_location) {
        var deferred = $q.defer();
        locationsStorageService.delete(_location).then(
            function (locations) { deferred.resolve(locations); },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };



    /*******************************************************************************
     SETTINGS
    *******************************************************************************/
    /*******************************************************************************************************************
    <summary> Retrieves settings from local storage </summary>
    <returns> {promise} All settings in local storage or a default set of settings </returns>
    *******************************************************************************************************************/
    var _getSettings = function () {
        var deferred = $q.defer();
        settingsStorageService.get().then(
            function (settings) { deferred.resolve(settings); },
            function (settings) { deferred.resolve(settings); } // Default settings
        );
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Saves settings to local storage </summary>
    <param> {Object} _settings: The settings object to save </param>
    <returns> {promise} Settings if save was successful, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _saveSettings = function (_settings) {
        var deferred = $q.defer();
        settingsStorageService.save(_settings).then(
            function (_settings) { deferred.resolve(_settings); },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };


    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var storageService = {};
    storageService.queryLocations = _queryLocations;
    storageService.saveLocation = _saveLocation;
    storageService.deleteLocation = _deleteLocation;
    storageService.saveSettings = _saveSettings;
    storageService.getSettings = _getSettings;
    return storageService;
}]);