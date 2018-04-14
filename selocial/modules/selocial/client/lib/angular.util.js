/**
 * AngularJS utilty functions
 */

/**
 * Safe-apply a callback
 * 
 * Calling $apply() this way prevents already-in-digest errors
 * 
 * @param {object} scope
 * @param {function} fn
 */
safeApply = function(scope, fn) {
    var phase = scope.$root.$$phase;
    if (phase === '$apply' || phase === '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        scope.$apply(fn);
    }
};

/**
 * Clean an object from angular $$ property pollution.
 * 
 * @param {object} obj
 * @returns {object}
 */
cleanObject = function(obj){
    return angular.fromJson(angular.toJson(obj));
};