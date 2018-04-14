import angular from 'angular';

/**
 * API service
 */
angular.module('core').service('api', function($q){
    'ngInject';
   
    return function(method, params){
        return $q(function(resolve, reject){
            Meteor.call(method.replace(/\./g, '_'), params || {}, function(err, response){
                if (err){
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    };
});
