'use strict';

weatherApp.factory('mapService', ['$q', '$resource', '$window', '$timeout', 'deviceService', 'API_KEY',

    function ($q, $resource, $window, $timeout, deviceService, API_KEY) {

        /*******************************************************************************
        This service is responsible for initialising, event handling and plotting
        our google map. It also resolves any issues we may have with a particular
        location whether that be a missing name, countryCode, lat & lng coords.
        *******************************************************************************/


        /*******************************************************************************
         VARIABLES & CONSTANTS
        *******************************************************************************/
        var _location = { name: '', countryCode: '', latitude: '', longitude: '', formattedAddress: '' },
            _map, _geocoder, _marker, _latlng, _mapOptions,
            _adrComponentIndex =   [{ nameIdx: 0, codeIdx: 0 }, { nameIdx: 0, codeIdx: 0 }, { nameIdx: 1, codeIdx: 1 }, { nameIdx: 1, codeIdx: 2 },
                                    { nameIdx: 2, codeIdx: 3 }, { nameIdx: 2, codeIdx: 3 }, { nameIdx: 3, codeIdx: 5 }, { nameIdx: 2, codeIdx: 5 },
                                    { nameIdx: 3, codeIdx: 6 }, { nameIdx: 3, codeIdx: 7 }, { nameIdx: 3, codeIdx: 8 }, { nameIdx: 5, codeIdx: 9 }]; // idx 9 & 10 are guessed



        /*******************************************************************************************************************
        <summary Initializes our google map </summary>
        *******************************************************************************************************************/
        var _init = function () {
            _latlng = new google.maps.LatLng(54, -6.123);                               // lat & lng object
            _mapOptions = { zoom: 6, center: _latlng, streetViewControl: false };       
            _map = new google.maps.Map(document.getElementById("map"), _mapOptions);    // map object

            google.maps.event.addListener(_map, 'click', function (event) {             // Map click handler
                _mapClickHandler(event.latLng);
            });
        };


        /*******************************************************************************************************************
        <summary> 'onclick' Event handler for map </summary>
        *******************************************************************************************************************/
        var _mapClickHandler = function (_latlng) {
            _location = { name: '', countryCode: '', latitude: _latlng.lat(), longitude: _latlng.lng() };
            _resolveAddress(_location).then(                            // attempt to resolve name & countryCode
                function (location) {
                    _plotCoordinates(_latlng.lat(), _latlng.lng());     // Plot the new coordinates
                    $('#search-input').val(location.name).trigger('change').blur();       // Force device keyboard interface to disappear
                },
                function (error) { deferred.reject(error); }            // Error could not be resoved
            );
        };


        /*******************************************************************************************************************
        <summary> Attempts to resolve lat & lng coordinates + countryCode for a given location name (geocoding) </summary>
        <returns> {promise: object} A location object if successful, otherwise an error message {promise: string} </returns>
        *******************************************************************************************************************/
        var _resolveLocation = function (_plocation) {
            var deferred = $q.defer()

            if (_plocation == _location.name) {                                             // This was previously resolved when the user clicked on the map
                deferred.resolve(_location);
            }
            else {                                                                          // Not previously resolved, user typed in a search crieria
                var newlocationName = _plocation.split(' ').join('+'),                      // Replace spaces with plus signs
                    newLocation = {};
                deviceService.networkServiceAvailable().then(
                    function (success) {
                        var googleurl = "https://maps.googleapis.com/maps/api/geocode/json?address=:locationName&key=" + API_KEY;
                        $resource(googleurl, { get: { method: 'get', isArray: false } }).get({ locationName: newlocationName }).$promise.then(
                            function (response) {
                                if (response.status == "OK") {                              // Check the response status
                                    var adrComp = response.results[0].address_components,   // Grab address array
                                        geoComp = response.results[0].geometry,             // Grab geometry
                                        len = adrComp.length,                               // Get the array length
                                        codeIdx = _adrComponentIndex[len].codeIdx;          // Depending on the size of the array, access indexes will vary

                                    // Location Name --------------------------------------------------------------------------------------------------------
                                    newLocation.name = _plocation;

                                    // Country Code----------------------------------------------------------------------------------------------------------
                                    if (len == 5) {
                                        if (adrComp[codeIdx + 1].short_name.length == 2) {
                                            _plocnewLocationation.countryCode = adrComp[codeIdx + 1].short_name;
                                        } else {
                                            newLocation.countryCode = adrComp[codeIdx].short_name;
                                        }
                                    }
                                    else if (len == 6) {
                                        if (adrComp[codeIdx - 1].short_name.length == 2) {
                                            newLocation.countryCode = adrComp[codeIdx - 1].short_name;
                                        } else {
                                            newLocation.countryCode = adrComp[codeIdx].short_name;
                                        }
                                    } else {
                                        newLocation.countryCode = adrComp[codeIdx].short_name;
                                    };

                                    // Lat & Lng-------------------------------------------------------------------------------------------------------------
                                    newLocation.latitude = geoComp.location.lat;
                                    newLocation.longitude = geoComp.location.lng;

                                    // Assign to local copy (maybe used later when trying to resolve a location) --------------------------------------------
                                    _location.formattedAddress = response.results[0].formatted_address.split(' ').join('+'); // make sure _location (local)
                                    _location.name = newLocation.name;
                                    _location.countryCode = newLocation.countryCode;
                                    _location.latitude = newLocation.latitude;
                                    _location.longitude = newLocation.longitude;

                                    // Resolve---------------------------------------------------------------------------------------------------------------
                                    deferred.resolve(newLocation); // We do not want 'formattedAddress' included in the return object
                                }
                                else { console.log(response); deferred.reject(_createReadableErrorMessage(status)); }   // Response status <> 'OK', create error message.
                            },
                            function (error) { deferred.reject("Problem accessing service"); }                         // Error accessing service
                        );
                    },
                    function (error) { deferred.reject(error); }                                                        // Error no network connection
                );
            }
            return deferred.promise;
        };


        /*******************************************************************************************************************
        <summary> Attempts to resolve an address for a given set of lat & lng coordinates (reverse geocoding) </summary>
        <returns> {promise: object} A location object if successful, otherwise an error message {promise: string} </returns>
        *******************************************************************************************************************/
        var _resolveAddress = function (_plocation) {
            var deferred = $q.defer()
            deviceService.networkServiceAvailable().then(
                function (success) {
                    var googleurl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=:latitude,:longitude&key=" + API_KEY,
                        newLocation = {};
                    $resource(googleurl, { get: { method: 'get', isArray: false } }).get({ latitude: _plocation.latitude, longitude: _plocation.longitude }).$promise.then(
                        function (response) {
                            if (response.status == "OK") {                              // Check the response status
                                var adrComp = response.results[0].address_components,   // Grab address array
                                    len = adrComp.length,                               // Get the array length
                                    nameIdx = _adrComponentIndex[len].nameIdx,          // Depending on the size of the array, access indexes will vary
                                    codeIdx = _adrComponentIndex[len].codeIdx;

                                // Location Name --------------------------------------------------------------------------------------------------------
                                newLocation.name = adrComp[nameIdx].long_name;
                                newLocation.name = (newLocation.name.slice(-1) == "'") ? newLocation.name.substr(0, newLocation.name.length - 1) : newLocation.name;

                                // Country Code----------------------------------------------------------------------------------------------------------
                                if (len == 5) {
                                    if (adrComp[codeIdx + 1].short_name.length == 2) {
                                        newLocation.countryCode = adrComp[codeIdx + 1].short_name;
                                    } else {
                                        newLocation.countryCode = adrComp[codeIdx].short_name;
                                    }
                                }
                                else if (len == 6) {
                                    if (adrComp[codeIdx - 1].short_name.length == 2) {
                                        newLocation.countryCode = adrComp[codeIdx - 1].short_name;
                                    } else {
                                        newLocation.countryCode = adrComp[codeIdx].short_name;
                                    }
                                } else {
                                    newLocation.countryCode = adrComp[codeIdx].short_name;
                                };

                                // Lat & Lng-------------------------------------------------------------------------------------------------------------
                                newLocation.latitude = _plocation.latitude;
                                newLocation.longitude = _plocation.longitude;

                                // Assign to local copy (maybe used later when trying to resolve a location) --------------------------------------------
                                _location.formattedAddress = response.results[0].formatted_address.split(' ').join('+'); // make sure _location (local)
                                _location.name = newLocation.name;
                                _location.countryCode = newLocation.countryCode;
                                _location.latitude = newLocation.latitude;
                                _location.longitude = newLocation.longitude;

                                // Resolve---------------------------------------------------------------------------------------------------------------
                                deferred.resolve(newLocation);  // We do not want 'formattedAddress' included in the return object
                            }
                            else { console.log(response); deferred.reject(_createReadableErrorMessage(status)); }   // Response status <> 'OK', create error message.
                        },
                        function (error) {  deferred.reject("Problem accessing service"); }                         // Error accessing service
                    );
                },                
                function (error) { deferred.reject(error); }                                                        // Error no network connection
            );
            return deferred.promise;
        };


        /*******************************************************************************************************************
        <summary> Creates a marker object on the map & pan to center of map </summary>
        *******************************************************************************************************************/
        var _plotCoordinates = function (_lat, _lng) {
            var _latlng = new google.maps.LatLng(_lat, _lng);                       // Create new LatLng obj
            if (angular.isDefined(_marker)) { _marker.setMap(null); }               // Clear all existing markers
            _marker = new google.maps.Marker({ map: _map, position: _latlng });     // Create a new marker
            $timeout(function () { _map.panTo(_marker.getPosition());  }, 1000);    // Pan center after 1 second
        };


        /*******************************************************************************************************************
        <summary> Creates a understandable error message </summary>
        <returns> {string} An error message </returns>
        *******************************************************************************************************************/
        var _createReadableErrorMessage = function (status) {
            var errorMsg = 'Address not found!';
            switch (status) {
                case "ZERO_RESULTS":
                    errorMsg = "Address not found";
                    break;
                case "OVER_QUERY_LIMIT":
                    errorMsg = 'Service quota reached!';
                    break;
                case "REQUEST_DENIED":
                    errorMsg = 'Service request denied';
                    break;
                case "INVALID_REQUEST":
                    errorMsg = 'Invalid service request';
                    break;
                case "UNKNOWN_ERROR":
                    errorMsg = 'An unknown error occured!';
                    break;
            };
            return errorMsg;
        };



        /*******************************************************************************
         SERVICE
        *******************************************************************************/
        var mapService = {};
        mapService.init = _init;
        mapService.resolveAddress = _resolveAddress;
        mapService. resolveLocation = _resolveLocation;
        mapService.plotCoordinates = _plotCoordinates;
        return mapService;
    }
]);