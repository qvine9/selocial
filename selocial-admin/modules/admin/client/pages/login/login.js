import angular from 'angular';
import templateUrl from './login.html';

angular.module('admin').config(function($stateProvider) { 
    'ngInject';
   
    $stateProvider.state('admin.login', {
        url: '/login',
        templateUrl: templateUrl,
        controllerAs: 'page',
        resolve: {user: ['auth', auth => auth.requireGuest()]},
        controller: AdminLoginController
    });
});
    
function AdminLoginController(error, auth){
    'ngInject';
    
    this.username = '';
    this.password = '';
    
    this.login = ()=>{
        auth.login(this.username, this.password, error);
    };
    
}
