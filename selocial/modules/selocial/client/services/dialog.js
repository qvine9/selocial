/**
 * Dialog service
 */
angular.module('selocial').service('dialog', function($uibModal){
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
            
            return $uibModal.open(_.extend({
                templateUrl: 'modules/selocial/client/dialogs/'+name+'/'+name+'.html',
                controller: name + 'DialogController',
                controllerAs: 'dlg',
                size: params && params.size ? params.size : 'sm',
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
                templateUrl: 'modules/selocial/client/dialogs/confirm/confirm.html',
                controller: ['$scope', 'message', function($scope, message){
                    $scope.message = message;
                }],
                size: 'md',
                backdrop: true,
                keyboard: true,
                resolve: resolve
            }).result;
        }
    };
});