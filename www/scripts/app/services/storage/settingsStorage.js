'use strict';

weatherApp.factory('settingsStorageService', ['$q', '$window', 'deviceService', function ($q, $window, deviceService) {

    /*******************************************************************************
    This service is responsible for persisting and retrieving settings to / from
    local storage.
    *******************************************************************************/


    /*******************************************************************************
     VARIABLES & CONSTANTS
    *******************************************************************************/
    var SETTINGS_LOCAL_STORAGE_KEY = 'weatherSettings',
        _settingsModel = {  distanceUnit: 'mi', pressureUnit: 'in', speedUnit: 'mph',  tempUnit: 'F' };


    /*******************************************************************************************************************
    <summary> Attempts to load all settings from local storage </summary>
    <returns> {array} All settings in storage or a default settings </returns>
    *******************************************************************************************************************/
    var _loadFromStorage = function () {
        return angular.fromJson($window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)) || _settingsModel;
    };


    /*******************************************************************************************************************
    <summary> Saves settings to local storage </summary>
    *******************************************************************************************************************/
    var _saveToStorage = function () {
        $window.localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, angular.toJson(_settingsModel));
    };


    /*******************************************************************************************************************
    <summary> Retrieves settings from local storage </summary>
    <returns> {promise} All settings in local storage or a default set of settings </returns>
    *******************************************************************************************************************/
    var _get = function () {
        var deferred = $q.defer();
        deviceService.LocalStorageServiceAvailable().then(              // Check for local storage
            function (success) { deferred.resolve(_loadFromStorage()); },
            function (error) { deferred.resolve(_settingsModel); }      // Default settings
        );
        return deferred.promise;
    };


    /*******************************************************************************************************************
    <summary> Saves settings to local storage </summary>
    <param> {Object} _settings: The settings object to save </param>
    <returns> {promise} Settings if save was successful, otherwise an error message </returns>
    *******************************************************************************************************************/
    var _save = function (_settings) {
        var deferred = $q.defer();
        deviceService.LocalStorageServiceAvailable().then(      // Check for local storage
            function (success) {
                _settingsModel = _settings;
                _saveToStorage();
                deferred.resolve(_settingsModel);
            },
            function (error) { deferred.reject(error); }
        );
        return deferred.promise;
    };


    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var settingsStorageService = {};
    settingsStorageService.get = _get;
    settingsStorageService.save = _save;
    return settingsStorageService;
}]);