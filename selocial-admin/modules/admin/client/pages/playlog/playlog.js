import angular from 'angular';
import templateUrl from './playlog.html';

angular.module('admin').config(function($stateProvider) {
    'ngInject';

    $stateProvider.state('admin.playlog', {
        url: '/playlog',
        templateUrl: templateUrl,
        controllerAs: 'page',
        resolve: {user: ['auth', auth => auth.requireUser()]},
        controller: AdminPlaylogController
    });
});

function AdminPlaylogController(api, $scope){
    'ngInject';
    
    $scope.exportLog = function(){
        window.open("https://selocial.com/playlog/" + $scope.from + '/' + $scope.till);
    };
}
