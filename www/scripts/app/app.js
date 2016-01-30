'use strict';
var weatherApp = angular.module('weatherApp', ['ngResource', 'ngRoute'])

.constant("API_KEY", "AIzaSyDnVTkc02_qNTpXKewOQjwOJqijaFfUWPo")

.run(['systemService', function (systemService) {
    systemService.initialize();
}]);
