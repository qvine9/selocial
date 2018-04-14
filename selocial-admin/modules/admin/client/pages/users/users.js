import angular from 'angular';
import templateUrl from './users.html';

angular.module('admin').config(function($stateProvider) { 
    'ngInject';
   
    $stateProvider.state('admin.users', {
        url: '/users',
        templateUrl: templateUrl,
        controllerAs: 'page',
        resolve: {user: ['auth', auth => auth.requireUser()]},
        controller: AdminUsersController
    });
});
    
function AdminUsersController(api){
    'ngInject';
    
    this.table = {
        enableSorting: true,
        enableFiltering: true,
        enableGridMenu: true,
        exporterCsvFilename: 'users.csv',
        exporterMenuPdf: false,
        data: 'page.users',
        rowHeight: 30,
        minRowsToShow: 10,
        columnDefs: [
            { field: 'username', name: 'Username' },
            { field: 'emails[0].address', name: 'Email' },
            { field: 'services.facebook.id', name: 'Facebook' },
            { field: 'services.twitter.screenName', name: 'Twitter' },
            { field: 'profile.name', name: 'Name' },
            { field: 'roles[0]', name: 'Type' },
            { field: 'createdAt', name: 'Signup Date', cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.createdAt | date:$root.dateTimeFormat }}</div>' },
            { field: 'timebankBalance', name: 'Timebank' },
            { field: 'tracks', name: 'Tracks' },
            { field: 'mixes', name: 'Mixes' },
            { field: 'playCount', name: 'Plays' }
        ]
    };
    
    api('users.list').then(users => this.users = users);
}
