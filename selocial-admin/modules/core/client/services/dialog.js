import angular from 'angular';

/**
 * Dialog service
 */
angular.module('core').service('dialog', function($uibModal){
    'ngInject';
    
    return {
        /**
         * Show a custom dialog
         */
        show: function(name, params, dialogParams){
            var resolve = {
                params: function(){
                    return params;
                },
                dialogParams: function(){
                    return dialogParams;
                }
            };
            
            var nameParts = name.split('.');
            
            return $uibModal.open(_.extend({
                templateUrl: 'modules/' + nameParts[0] + '/client/dialogs/' + nameParts[1] + '/' + nameParts[1] + '.html',
                controller: name.replace(/\./g, '_') + '_DialogController',
                controllerAs: 'dlg',
                size: 'md',
                backdrop: true,
                keyboard: true,
                animation: true,
                resolve: resolve
            }, dialogParams)).result;
        },
        
        /**
         * Confirm dialog
         */
        confirm: function(message, dialogParams){
            var resolve = {
                message: function(){
                    return message;
                },
                dialogParams: function(){
                    return dialogParams;
                }
            };
            
            return $uibModal.open({
                templateUrl: 'modules/core/client/dialogs/confirm/confirm.html',
                controller: function($scope, message){
                    'ngInject';
                    $scope.message = message;
                },
                size: 'md',
                backdrop: true,
                keyboard: true,
                resolve: resolve
            }).result;
        }
    };
});