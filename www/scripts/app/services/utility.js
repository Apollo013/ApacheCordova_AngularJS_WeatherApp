'use strict';
weatherApp.factory('utilityService', [function () {

    /*******************************************************************************
    This service performs some conversion calculations among other tasks.
    *******************************************************************************/

    /*******************************************************************************************************************
    <summary> Exchanges a partial day name for a full day name </summary>
    <parm> {string} _partialDayName: The name part of day e.g. sat, sun, etc.. </parm>
    <returns> {string} The full name of a day </returns>
    *******************************************************************************************************************/
    var _getFullDayName = function (_partialDayName) {
        var _day = '';

        switch (_partialDayName) {
            case 'Sun':
                _day = "Sunday";
                break;
            case 'Mon':
                _day = "Monday";
                break;
            case 'Tue':
                _day = "Tuesday";
                break;
            case 'Wed':
                _day = "Wednesday";
                break;
            case 'Thu':
                _day = "Thursday";
                break;
            case 'Fri':
                _day = "Friday";
                break;
            case 'Sat':
                _day = "Saturday";
                break;
        }
        return _day;
    }


    /*******************************************************************************************************************
    <summary> Convert Speed: If unitType = 'mph', convert to 'kph' & v.v. </summary>
    *******************************************************************************************************************/
    var _convertSpeed = function (value, unitType) {
        return (unitType == 'mph') ? Math.round(value * 1.60934) + ' kph' : Math.round(value / 1.60934) + ' mph';
    };


    /*******************************************************************************************************************
    <summary> Convert distance: If unitType = 'mi', convert to 'km' & v.v. </summary>
    *******************************************************************************************************************/
    var _convertDistance = function (value, unitType) {
        return (unitType == 'mi') ? Math.round(value * 1.60934) + ' km' : Math.round(value / 1.60934) + ' mile(s)' ;
    };


    /*******************************************************************************************************************
    <summary> Convert temperature: If unitType = 'F', convert to 'C' & v.v. </summary>
    *******************************************************************************************************************/
    var _convertTemperature = function (value, unitType) {
        return (unitType == 'F') ? Math.round((value - 32) / 1.8) : Math.round((value * 1.8) + 32);
    }


    /*******************************************************************************************************************
    <summary> Convert temperature degree display: If unitType = 'F', convert to 'C' & v.v. </summary>
    *******************************************************************************************************************/
    var _convertTemperatureUnitDisplay = function (unitType) {
        return (unitType == 'F') ? '\u00B0' + 'C' : '\u00B0' + 'F';
    }



    /*******************************************************************************
     SERVICE
    *******************************************************************************/
    var utilityService = {};
    utilityService.getFullDayName = _getFullDayName;
    utilityService.convertSpeed = _convertSpeed;
    utilityService.convertDistance = _convertDistance;
    utilityService.convertTemperature = _convertTemperature;
    utilityService.convertTemperatureUnitDisplay = _convertTemperatureUnitDisplay;
    return utilityService;
}]);
