import angular from 'angular';
import templateUrl from './dashboard.html';

angular.module('admin').config(function($stateProvider) { 
    'ngInject';
   
    $stateProvider.state('admin.dashboard', {
        url: '/dashboard',
        templateUrl: templateUrl,
        controllerAs: 'page',
        resolve: {user: ['auth', auth => auth.requireUser()]},
        controller: AdminDashboardController
    });
});
    
function AdminDashboardController(){
    'ngInject';
    
}
