/**
 * Selocial Auth service
 */
angular.module('selocial').service('auth', function($q, $auth, error, $rootScope){
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
                        $rootScope.$broadcast('selocial.login');
                        resolve(Meteor.userId());
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
                        $rootScope.$broadcast('selocial.login');
                        resolve(Meteor.userId());
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Sign up a user
         * 
         * @param {obect} user
         * @returns {promise}
         */
        createUser: function(userData){
            var promise = $q(function(resolve, reject){
                Accounts.createUser(userData, function(err){
                    if (err){
                        reject(err);
                    } else {
                        $rootScope.$broadcast('selocial.login');

                        resolve(Meteor.userId());
                    }
                });
            });
            promise.catch(error);
            return promise;
        },
        
        /**
         * Signup proxy
         * 
         * @param {object} userData
         * @returns {promise}
         */
        signup: function(userData){
            return this.createUser(userData);
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
                        $rootScope.$broadcast('selocial.logout');
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
         * Require a user and pass it to a callback to check permission.
         * Callback must taka a user argument.
         * 
         * @param {function} callback
         * @returns {promise}
         */
        requireUser: function(callback){
            if (!callback) {
                return $auth.requireUser();
            }
            return $auth.requireValidUser(callback);
        },
        
        /**
         * Require a user with the specified role
         * 
         * @param {string} roleName
         * @returns {promise}
         */
        requireRole: function(roleName){
            return auth.requireUser(function(user){
                return roleName === '*' || _.contains(user.roles, roleName);
            });
        },
        
        /**
         * Require a huest user
         * 
         * @returns {promise}
         */
        requireGuest: function(){
            return $q(function(resolve, reject){
                $auth.requireUser().then(function(){
                    reject('GUEST_ONLY');
                }).catch(function(){
                    resolve(true);
                });
            });
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
        }
        
    };
    
    return auth;
});