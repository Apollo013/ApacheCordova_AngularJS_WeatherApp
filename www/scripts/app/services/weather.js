'use strict';

weatherApp.factory('weatherService', ['$q', '$resource', 'storageService', 'utilityService', 'mapService', 'deviceService',

    function ($q, $resource, storageService, utilityService, mapService, deviceService) {

        /*******************************************************************************
         VARIABLES & CONSTANTS
        *******************************************************************************/
        var _weatherIconMap = [
		    'storm', 'storm', 'storm', 'lightning', 'lightning', 'snow', 'hail', 'hail',
		    'drizzle', 'drizzle', 'rain', 'rain', 'rain', 'snow', 'snow', 'snow', 'snow',
		    'hail', 'hail', 'fog', 'fog', 'fog', 'fog', 'wind', 'wind', 'snowflake',
		    'cloud', 'cloud_moon', 'cloud_sun', 'cloud_moon', 'cloud_sun', 'moon', 'sun',
		    'moon', 'sun', 'hail', 'sun', 'lightning', 'lightning', 'lightning', 'rain',
		    'snowflake', 'snowflake', 'snowflake', 'cloud', 'rain', 'snow', 'lightning'
        ],
        _weatherModel = {
            code: '',
            valid: false,
            display: {
                outlook: '',
                temp: '',
                minTemp: '',
                maxTemp: '',
                windSpeed: '',
                windChill: '',
                humidity: '',
                visibility: '',
                sunrise: '',
                sunset: '',
                mainImage: 'images/blank.png'
            },
            location: {
                name: '',
                countryCode: '',
                latitude: '',
                longitude: ''
            },
            units: {
                speedUnit: '',
                tempUnit: '',
                distanceUnit: '',
                pressureUnit: ''
            },
            wind: {
                windSpeed: '',
                windChill: '',
                windDirection: ''
            },
            atmosphere: {
                humidity: '',
                visibility: ''
            },
            temperature: {
                temp: '',
                minTemp: '',
                maxTemp: ''
            },
            fiveDayForecast: []
        };


        /*******************************************************************************************************************
        <summary> Gets the current weather details </summary>
        <returns> {object} The weather model </returns>
        *******************************************************************************************************************/
        var _getWeatherModel = function () { return _weatherModel; }


        /*******************************************************************************************************************
        <summary> Clears all weather details </summary>
        *******************************************************************************************************************/
        var _reset = function () {
            _weatherModel = {
                code: '',                
                valid: false,
                display: {
                    outlook: '',
                    tempUnitDisplay: '',
                    temp: '',                    
                    minTemp: '',
                    maxTemp: '',
                    windSpeed: '',
                    windChill: '',
                    humidity: '',
                    visibility: '',
                    sunrise: '',
                    sunset: '',
                    mainImage: 'images/blank.png'
                },
                location: {
                    name: '',
                    countryCode: '',
                    latitude: '',
                    longitude: ''
                },
                units: {
                    speedUnit: '',
                    tempUnit: '',
                    distanceUnit: '',
                    pressureUnit: ''
                },
                wind: {
                    windSpeed: '',
                    windChill: '',
                    windDirection: ''
                },
                atmosphere: {
                    humidity: '',
                    visibility: ''
                },
                temperature: {
                    temp: '',
                    minTemp: '',
                    maxTemp: ''
                },
                fiveDayForecast: []
            };
        };


        /*******************************************************************************************************************
        <summary> Attempts contact weather service to retrieve weather details for a given location </summary>
        <params> The location object to get the weather details for </params>
        <returns> true if successful, false otherwise </returns>
        *******************************************************************************************************************/
        var _getWeather = function (_location) {            
            var deferred = $q.defer();
            deviceService.networkServiceAvailable().then(               // Check network service
                function (success) {
                    var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22:name%2C%20:countryCode%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
                    $resource(url, { get: { method: 'get', isArray: false } }).get({ name: _location.name, countryCode: _location.countryCode }).$promise.then(
                        function (weatherdetails) {
                            if (weatherdetails.query.count > 0 && weatherdetails.query.results.channel.item.title != "City not found") {    // Check response
                                _weatherModel.location = _location;
                                _parseWeatherDetails(weatherdetails);   // Parse & assign results to our weather model
                                deferred.resolve(_weatherModel);        // Return our weather model
                            }
                            else { deferred.reject("Sorry, No results found!"); }
                        },
                        function (error) { deferred.reject("Sorry, error accessing weather service!"); }
                    );
                },
                 function (error) { deferred.reject(error); }           // Error no network connection
            );
            return deferred.promise;
        };


        /*******************************************************************************************************************
        <summary> Recalculates values & formats the appropriate output (e.g. fahrenheit or celcius) </summary>
        <returns> true if successful, false otherwise </returns>
        *******************************************************************************************************************/
        var _convertValues = function () {

            // Make sure we have valid details 
            if (!_weatherModel.valid) { return false; };

            return storageService.getSettings().then(
                function (settings) {
                    
                    // SPEED ----------------------------------------------------------------------------------------------------------------------------------------------------------
                    if (settings.speedUnit != _weatherModel.units.speedUnit) {    // If our 'speed' setting doe's not match what came back in the response
                        _weatherModel.display.windSpeed = utilityService.convertSpeed(_weatherModel.wind.windSpeed, _weatherModel.units.speedUnit);
                    }
                    else {
                        _weatherModel.display.windSpeed = _weatherModel.wind.windSpeed + ' ' + _weatherModel.units.speedUnit;
                    };

                    // TEMPERATURE ----------------------------------------------------------------------------------------------------------------------------------------------------
                    if (settings.tempUnit != _weatherModel.units.tempUnit) {    // If our 'temperature' setting doe's not match what came back in the response

                        // Temperature unit displat
                        _weatherModel.display.tempUnitDisplay = utilityService.convertTemperatureUnitDisplay(_weatherModel.units.tempUnit);

                        // Current Temperature
                        _weatherModel.display.temp = utilityService.convertTemperature(_weatherModel.temperature.temp, _weatherModel.units.tempUnit);

                        // Min / Max Temperatures
                        _weatherModel.display.minTemp = utilityService.convertTemperature(_weatherModel.temperature.minTemp, _weatherModel.units.tempUnit) + _weatherModel.display.tempUnitDisplay;
                        _weatherModel.display.maxTemp = utilityService.convertTemperature(_weatherModel.temperature.maxTemp, _weatherModel.units.tempUnit) + _weatherModel.display.tempUnitDisplay;
                        
                        // Wind Chill
                        _weatherModel.display.windChill = utilityService.convertTemperature(_weatherModel.wind.windChill, _weatherModel.units.tempUnit) + _weatherModel.display.tempUnitDisplay;

                        // 5 Day Forecast
                        $.each(_weatherModel.fiveDayForecast, function (idx, item) {
                            item.minTempDisplay = utilityService.convertTemperature(item.minTemp, _weatherModel.units.tempUnit) + _weatherModel.display.tempUnitDisplay;
                            item.maxTempDisplay = utilityService.convertTemperature(item.maxTemp, _weatherModel.units.tempUnit) + _weatherModel.display.tempUnitDisplay;
                        });

                    }
                    else {
                        _weatherModel.display.tempUnitDisplay = '\u00B0' + _weatherModel.units.tempUnit;
                        _weatherModel.display.temp = _weatherModel.temperature.temp;
                        _weatherModel.display.minTemp = _weatherModel.temperature.minTemp + '\u00B0' + _weatherModel.units.tempUnit;
                        _weatherModel.display.maxTemp = _weatherModel.temperature.maxTemp + '\u00B0' + _weatherModel.units.tempUnit;
                        _weatherModel.display.windChill = _weatherModel.wind.windChill + '\u00B0' + _weatherModel.units.tempUnit;

                        // 5 Day Forecast
                        $.each(_weatherModel.fiveDayForecast, function (idx, item) {
                            item.minTempDisplay = item.minTemp + '\u00B0' + _weatherModel.units.tempUnit;
                            item.maxTempDisplay = item.minTemp + '\u00B0' + _weatherModel.units.tempUnit;
                        });
                    };                    

                    // DISTANCE -------------------------------------------------------------------------------------------------------------------------------------------------------
                    if (settings.distanceUnit != _weatherModel.units.distanceUnit) {    // If our 'distance' setting doe's not match what came back in the response
                        _weatherModel.display.visibility = utilityService.convertDistance(_weatherModel.atmosphere.visibility, _weatherModel.units.distanceUnit);
                    }
                    else {
                        var unitDisplay = (_weatherModel.units.distanceUnit == 'mi') ? ' mile(s)' : ' km';
                        _weatherModel.display.visibility = _weatherModel.atmosphere.visibility + unitDisplay;
                    };

                    // MISC -----------------------------------------------------------------------------------------------------------------------------------------------------------
                    _weatherModel.display.humidity = _weatherModel.atmosphere.humidity + "%";

                    // Return
                    return true;
                },
                function (error) { return false; }
            );
        };


        /*******************************************************************************************************************
        <summary> Parses the weather details returned from the service </summary>
        *******************************************************************************************************************/
        var _parseWeatherDetails = function (weatherDetails) {
            var weather = weatherDetails.query.results.channel;     // Grab main weather object

            // TODAY'S WEATHER FORECAST ------------------------------------------------------------------------
            // Units
            var units = weather.units;
            _weatherModel.units.speedUnit = units.speed;
            _weatherModel.units.tempUnit = units.temperature;
            _weatherModel.units.distanceUnit = units.distance;
            _weatherModel.units.pressureUnit = units.pressure;

            // Wind
            var wind = weather.wind;
            _weatherModel.wind.windSpeed = wind.speed;
            _weatherModel.wind.windChill = wind.chill;
            _weatherModel.wind.windDirection = wind.direction;

            // Atmosphere
            var atmosphere = weather.atmosphere;
            _weatherModel.atmosphere.humidity = atmosphere.humidity;
            _weatherModel.atmosphere.visibility = atmosphere.visibility;

            // Astronomy
            var astronomy = weather.astronomy;
            _weatherModel.display.sunrise = astronomy.sunrise;
            _weatherModel.display.sunset = astronomy.sunset;

            // Current Temperature
            var condition = weather.item.condition;
            _weatherModel.temperature.temp = condition.temp;

            // Min & Max Temperatures (Today)
            var forecast = weather.item.forecast[0];
            _weatherModel.temperature.minTemp = forecast.low;
            _weatherModel.temperature.maxTemp = forecast.high;

            // Outlook
            _weatherModel.display.outlook = condition.text;

            // Weather Code
            _weatherModel.code = condition.code;

            // Main Image
            _weatherModel.display.mainImage = 'images/' + _weatherIconMap[condition.code] + '.png';


            // 5 DAY FORECAST ----------------------------------------------------------------------------------
            _weatherModel.fiveDayForecast = [];                 // Clear existing forecasts
            var forecasts = weather.item.forecast;
            $.each(forecasts, function (idx, item) {
                var forecast = {
                    date: utilityService.getFullDayName(item.day) + ', ' + item.date,
                    minTemp: item.low,
                    maxTemp: item.high,
                    minTempDisplay: '',
                    maxTempDisplay: '',
                    code: item.code,
                    weatherImage: 'images/' + _weatherIconMap[item.code] + '.png'
                };
                _weatherModel.fiveDayForecast.push(forecast);   // Add to 5 day forecast array
            });
            _weatherModel.valid = true;                         // Validate

            // RECALCULATE VALUES & FORMAT DISPLAYED OUTPUT ----------------------------------------------------
            _convertValues();
        };



        /*******************************************************************************
         SERVICE
        *******************************************************************************/
        var weatherService = {};
        weatherService.getWeather = _getWeather;
        weatherService.weatherModel = _getWeatherModel;
        weatherService.reset = _reset;
        weatherService.convertValues = _convertValues;
        return weatherService;
    }
]);
