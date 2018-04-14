/**
 * Selocial API module
 */
angular.module('selocial').service('api', function($q){
    var api = function(endpoint, params){
        return $q(function(resolve, reject){
            Meteor.call(endpoint.replace(/\./g, '_'), cleanObject(params), function(err, result){
                if (err){
                    return reject(err);
                }
                resolve(result);
            });
        });
    };
    
    /**
     * Bind a variable to the scope
     */
    api.bind = function(scope, variable, promise){
        eval('scope.'+variable+' = null');
        promise.then(function(results){
            eval('scope.'+variable+' = results');
        });
        return promise;
    };
    
    return api;
});