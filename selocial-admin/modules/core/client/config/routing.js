import angular from 'angular';

/**
 * Core routing config
 */
angular.module('core').config(function($locationProvider, $urlRouterProvider, $stateProvider) { 
    'ngInject';
   
    $locationProvider.html5Mode(true); 
    $urlRouterProvider.otherwise('/admin/dashboard');
});