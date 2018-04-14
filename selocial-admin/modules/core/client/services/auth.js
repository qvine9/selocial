import angular from 'angular';

/**
 * Authentication service
 */
angular.module('core').service('auth', function($q, $auth, error, $rootScope){
    'ngInject';
    
    var auth = {
        
        /**
         * Login
         * 
         * @param {string} username
         * @param {string} password
         * @returns {promise}
         */
        login: function(username, password){
            var promise = $q(function(resolve, reject){
                Meteor.loginWithPassword(username, password, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(Meteor.userId());
                        setTimeout(function(){
                            $rootScope.$broadcast('login');
                        }, 1);
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Login with auth provider
         * 
         * @param {string} provider
         * @returns {promise}
         */
        loginWith: function(provider){
            var promise = $q(function(resolve, reject){
                var loginMethod = 'loginWith' + provider.substr(0,1).toUpperCase() + provider.substr(1);
                Meteor[loginMethod](function(err, result){
                    if (err){
                        reject(err);
                    } else {
                        resolve(Meteor.userId());
                        setTimeout(function(){
                            $rootScope.$broadcast('login');
                        }, 1);
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Create user
         * 
         * @param {obect} user
         * @returns {promise}
         */
        signup: function(userData){
            var promise = $q(function(resolve, reject){
                Accounts.createUser(userData, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(Meteor.userId());
                        setTimeout(function(){
                            $rootScope.$broadcast('login');
                        }, 1);
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Logout
         */
        logout: function(){
            return $q(function(resolve, reject){
                Meteor.logout(function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(true);
                        setTimeout(function(){
                            $rootScope.$broadcast('logout');
                        }, 1);
                    }
                });
            });
        },
        
        /**
         * Send password reset instructions
         * 
         * @param {string} email
         * @returns {promise}
         */
        forgotPassword: function(email){
            var promise = $q(function(resolve, reject){
                Accounts.forgotPassword({email: email}, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Reset password
         * 
         * @param {string} password
         * @param {string} token
         */
        resetPassword: function(password, token){
            var promise = $q(function(resolve, reject){
                Accounts.resetPassword(token, password, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(true);
                        $rootScope.$broadcast('login');
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Change the current user's password
         * 
         * @param {string} oldPassword
         * @param {string} newPassword
         */
        changePassword: function(oldPassword, newPassword){
            var promise = $q(function(resolve, reject){
                Accounts.changePassword(oldPassword, newPassword, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Check if the current user has the role
         *
         * @param {string} name
         */
        hasRole: function(name){
            var user = Meteor.user();
            if (!user) {
                return false;
            }
            return _.contains(user.roles, name);
        },
        
        /**
         * Require a user and pass it to a callback to check permission.
         * Callback must taka a user argument.
         * 
         * @param {function} callback
         * @returns {promise}
         */
        requireUser: function(callback){
            return callback ? $auth.requireValidUser(callback) : $auth.requireUser();
        },
        
        /**
         * Require a user with the specified role
         * 
         * @param {string} roleName
         * @returns {promise}
         */
        requireRole: function(roleName){
            return auth.requireUser(function(){
                return auth.hasRole(name);
            });
        },
        
        /**
         * Require a huest user
         * 
         * @returns {promise}
         */
        requireGuest: function(){
            return $q(function(resolve, reject){
                if (Meteor.userId()){
                    reject('GUEST_ONLY');
                } else {
                    resolve(true);
                }
            });
        }
    };
    
    return auth;
});