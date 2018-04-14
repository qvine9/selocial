import angular from 'angular';
import templateUrl from './transactions.html';

angular.module('admin').config(function($stateProvider) { 
    'ngInject';
   
    $stateProvider.state('admin.transactions', {
        url: '/transactions',
        templateUrl: templateUrl,
        controllerAs: 'page',
        resolve: {user: ['auth', auth => auth.requireUser()]},
        controller: AdminTransactionsController
    });
});
    
function AdminTransactionsController(api){
    'ngInject';
    
    this.table = {
        enableSorting: true,
        enableFiltering: true,
        enableGridMenu: true,
        exporterCsvFilename: 'transactions.csv',
        exporterMenuPdf: false,
        data: 'page.transactions',
        rowHeight: 30,
        minRowsToShow: 10,
        columnDefs: [
            { field: 'sourceUserId', name: 'From' },
            { field: 'targetUserId', name: 'To' },
            { field: 'credits', name: 'Amount' },
            { field: 'params.action', name: 'Action' },
            { field: 'date', name: 'createdAt' }
        ]
    };
    
    api('transactions.list').then(transactions => this.transactions = transactions);
}
