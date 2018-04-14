import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularMeteorAuth from 'angular-meteor-auth';
import angularUiRouter from 'angular-ui-router';
import templateUrl from './admin.html';

angular.module('admin', [
    angularMeteor,
    angularMeteorAuth,
    angularUiRouter
])

.config(function($stateProvider) { 
    'ngInject';
   
    $stateProvider
        .state('admin', {
            url: '/admin',
            templateUrl: templateUrl,
            abstract: true,
            controllerAs: 'admin',
            controller: function($scope, auth){ 
                'ngInject'

                this.isCollapsed = true;

                $scope.$on('$stateChangeSuccess', ()=>{
                    this.isCollapsed = true;
                });
                
                this.logout = ()=>{
                    auth.logout();
                };
            }
        });
})    
    
.run(function($rootScope){ 
    'ngInject';
    
    $rootScope.dateTimeFormat = 'dd/MM/yyyy HH:mm'
});