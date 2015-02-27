'use strict';
/**
  * Risk module - whole app
  */
var app = angular.module('risk', ['ngRoute', 'blockUI', 'ngDialog']);

/**
  * Routing to templates and controllers
  */
app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : 'client/app/components/handshake/handshake.html',
        controller  : 'HandshakeController'
    }).when('/risk/setup', {
        templateUrl : 'client/app/components/risk/risk.html',
        controller  : 'RiskSetupController'
    }).when('/risk', {
        templateUrl : 'client/app/components/risk/risk.html',
        controller  : 'RiskController'
    });
});