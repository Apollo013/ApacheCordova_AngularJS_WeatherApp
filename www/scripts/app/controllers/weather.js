'use strict';

weatherApp.controller('weatherController', ['$rootScope', '$scope', '$interval', 'storageService', 'weatherService', 'mapService', 'geoLocationService', 'notifyService',

    function ($rootScope, $scope, $interval, storageService, weatherService, mapService, geoLocationService, notifyService) {
        
        /*******************************************************************************
         VARIABLES & CONSTANTS
        *******************************************************************************/
        $scope.title = 'Not Another Weather App!';
        $scope.location = undefined;
        $scope.weatherDisplay = { mainImage: 'images/blank.png' };
        $scope.fiveDayForecast = [];
        $scope.locations = [];
        $scope.viewTodaysForecast = true;
        $scope.settings = {  distanceUnit: 'mi', pressureUnit: 'in',  speedUnit: 'mph', temperatureUnit: 'F'  };
        $scope.locationNameSearch = '';
        $scope.disableSearchBar = true;



        /*******************************************************************************
         GEO-LOCATION SERVICE
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Attempts to get the device's current location & weather details </summary>
        *******************************************************************************************************************/
        $scope.home = function () {
            notifyService.displayLoaderDialog();
            geoLocationService.getCurrentLocation().then(
                function (_location) { $scope.getWeather(_location); },
                function (error) { notifyService.displayErrorInfo(error); }
            );
        };



        /*******************************************************************************
         WEATHER
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Re-get the weather details for the current location </summary>
        *******************************************************************************************************************/
        $scope.refresh = function () {
            notifyService.displayLoaderDialog();        // Display loader (modal dialog)
            $scope.getWeather($scope.location);
        };

        /*******************************************************************************************************************
        <summary> Gets the weather for an existing location </summary>
        *******************************************************************************************************************/
        $scope.getWeather = function (_location) {  // Check that we have a location to work with
            if (!angular.isDefined(_location)) {
                notifyService.displayErrorDialog("No location selected");
                notifyService.hideLoaderDialog()
                return false;
            };
            weatherService.getWeather(_location).then(
                function (_weatherModel) {
                    $scope.location = _weatherModel.location;
                    $scope.weatherDisplay = _weatherModel.display;
                    $scope.fiveDayForecast = _weatherModel.fiveDayForecast;
                    mapService.plotCoordinates($scope.location.latitude, $scope.location.longitude);
                    notifyService.hideLoaderDialog()
                },
                function (error) { notifyService.displayErrorInfo(error); }
            );
        };



        /*******************************************************************************
         LOCATIONS
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Gets all locations from local storage </summary>
        *******************************************************************************************************************/
        $scope.queryLocations = function () {
            storageService.queryLocations().then( function (locations) { $scope.locations = locations; } );
        };

        /*******************************************************************************************************************
        <summary> Saves a location (new or existing) to local storage </summary>
        *******************************************************************************************************************/
        $scope.saveLocation = function () {
            storageService.saveLocation($scope.location).then(
                function (locations) {  $scope.locations = locations; },
                function (error) { notifyService.displayErrorDialog(error) }
            );
        };

        /*******************************************************************************************************************
        <summary> Removes an existing location from local storage </summary>
        *******************************************************************************************************************/
        $scope.deleteLocation = function (_location) {
            storageService.deleteLocation(_location).then(
                function (locations) { $scope.locations = locations; },
                function (error) { notifyService.displayErrorDialog(error) }
            );
        };

        /*******************************************************************************************************************
        <summary> Handles list item click event for locations </summary>
        *******************************************************************************************************************/
        $scope.selectLocation = function (_location) {
            $('.ui-panel').panel("close");
            notifyService.displayLoaderDialog();
            $scope.getWeather(_location);
        };

        

        /*******************************************************************************
         SETTINGS
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Retrieves settings from local storage </summary>
        *******************************************************************************************************************/
        $scope.getSettings = function () {
            storageService.getSettings().then( function (settings) { $scope.settings = settings; } );
        };

        /*******************************************************************************************************************
        <summary> Watch for any changes to settings, persist to local storage and re-format the display </summary>
        *******************************************************************************************************************/
        $scope.$watchGroup(['settings.distanceUnit', 'settings.pressureUnit', 'settings.speedUnit', 'settings.tempUnit'], function (newValues, oldValues) {
            if (newValues != oldValues) {               
                storageService.saveSettings($scope.settings).then(
                    function (success) { weatherService.convertValues(); },
                    function (error) { notifyService.displayErrorDialog(error); }
                );
            };
        });



        /*******************************************************************************
         MAP SERVICE & SEARCH
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Watch for any changes to search field & automatically enable/disable search button </summary>
        *******************************************************************************************************************/
        $scope.$watch('locationNameSearch', function (newValue, oldValue) {
            $scope.disableSearchBar = newValue.length > 0 ? false : true;
        });

        /*******************************************************************************************************************
        <summary> Searches for a location & weather details based on a search input (locationNameSearch) </summary>
        *******************************************************************************************************************/
        $scope.search = function (getWeather) {
            if ($scope.locationNameSearch.length == 0 || $scope.locationNameSearch != $('#search-input').val()) {
                $scope.locationNameSearch = $('#search-input').val();
            }
            if ($scope.locationNameSearch.length == 0 || $scope.locationNameSearch == $scope.location.name) { return false; };
            
            mapService.resolveLocation($scope.locationNameSearch).then(
                function (_location) {
                    if (getWeather) {
                        notifyService.displayLoaderDialog();
                        $scope.getWeather(_location);
                    }
                    else { mapService.plotCoordinates(_location.latitude, _location.longitude); };
                },
                function (error) { notifyService.displayErrorDialog(error); }    // Location could not be resolved
            );
        };


        /*******************************************************************************************************************
        <summary> Watch for any changes to settings, persist to local storage and re-format the display </summary>
        *******************************************************************************************************************/
        $scope.clear = function () { $scope.locationNameSearch = ''; };



        /*******************************************************************************
         INITIALIZE
        *******************************************************************************/
        /*******************************************************************************************************************
        <summary> Listen for '$rootScope.ready' == true (see 'system.js => onDeviceReady()'). then fetch weather details. </summary>
        *******************************************************************************************************************/
        var _deviceReadyListener = $interval(            
            function () {   // Listen for a change to '$rootScope.ready'
                if ($rootScope.ready) {                    
                    _killDeviceReadyListener();
                    _init();
                };
            },
        500);

        /*******************************************************************************************************************
        <summary> Kill the $interval service object </summary>
        *******************************************************************************************************************/
        var _killDeviceReadyListener = function () {            
            if (angular.isDefined(_deviceReadyListener)) {
                $interval.cancel(_deviceReadyListener);
                _deviceReadyListener = undefined;
            };
        };

        /*******************************************************************************************************************
        <summary> Initialize the system </summary>
        *******************************************************************************************************************/
        var _init = function () {
            mapService.init();          // Generate google map
            $scope.home();              // Get current device location and get weather details
            $scope.queryLocations();    // Get list of pre-defined locations
            $scope.getSettings();       // Get settings

            document.addEventListener('resume', _onResume, false);
        };

        /*******************************************************************************************************************
        <summary> 'resume' event handler </summary>
        *******************************************************************************************************************/
        var _onResume = function () { $scope.refresh(); };

    }
]);
