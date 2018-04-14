/**
 * Selocial Error service
 */
angular.module('selocial').service('error', function($rootScope){
    var handler = function(err){
        if (err){
            if (_.isArray(err)) {
                _.each(err, function(e){
                    handler(e);
                });
                return;
            }
            
            // An error occured
            if (typeof(console) !== 'undefined' && console.error){
                console.error(err);
            }
            $rootScope.$broadcast('selocial.error', err);
            
            var errorMessage;
            
            if (typeof(err) === "string") {
                errorMessage = err;
            } else if (err.reason) {
                errorMessage = err.reason;
            } else if (err.error) {
                switch (err.error) {
                    case "E_VALIDATION":
                        var errorMessages = [];
                        _.each(err.invalidAttributes, function(messages){
                            errorMessages = errorMessages.concat(_.pluck(messages, "message"));
                        });
                        errorMessage = errorMessages.join("\n");
                        break;
                    default:
                        errorMessage = err.error;
                }
            } else if (err.message){
                errorMessage = err.message;
            } else if (err.summary){
                errorMessage = err.summary;
            }
            
            if (errorMessage) {
                $rootScope.$broadcast('selocial.errorMessage', errorMessage);
            }
        }
    };
    return handler;
});