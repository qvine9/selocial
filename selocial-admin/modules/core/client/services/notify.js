import angular from 'angular';

/**
 * Notify service
 */
angular.module('core').service('notify', function($mdToast){
    'ngInject';
    
    /**
     * Notify
     */
    var notify = function(message){
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('bottom right')
        );
    };
    
    return {
        /**
         * Show an error message
         * 
         * @param {string} message
         */
        error: notify,
        
        /**
         * Show a success message
         * 
         * @param {string} message
         */
        success: notify,
        
        /**
         * Show an info message
         * 
         * @param {string} message
         */
        info: notify
    };
});