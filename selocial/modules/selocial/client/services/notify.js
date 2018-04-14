/**
 * Notify service
 */
angular.module('selocial').service('notify', function(){
    return {
        /**
         * Show an error message
         * 
         * @param {string} message
         */
        error: function(message){
            $.notify(
                {
                    message: message,
                    icon: 'fa fa-warning'
                },
                {
                    type: 'danger',
                    delay: 3000,
                    z_index: 9999,
                    animate: {
                        enter: 'animated bounceInRight',
                        exit: 'animated bounceOutRight'
                    }
                }
            );
        },
        
        /**
         * Show a success message
         * 
         * @param {string} message
         */
        success: function(message){
            $.notify(
                {
                    message: message,
                    icon: 'fa fa-check'
                },
                {
                    type: 'success',
                    delay: 3000,
                    z_index: 9999,
                    animate: {
                        enter: 'animated bounceInRight',
                        exit: 'animated bounceOutRight'
                    }
                }
            );
        },
        
        /**
         * Show an info message
         * 
         * @param {string} message
         */
        info: function(message){
            $.notify(
                {
                    message: message,
                    icon: 'fa fa-info-circle'
                },
                {
                    type: 'info',
                    delay: 3000,
                    z_index: 9999,
                    animate: {
                        enter: 'animated bounceInRight',
                        exit: 'animated bounceOutRight'
                    }
                }
            );
        }
    };
});