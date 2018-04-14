/**
 * Schema utilty functions
 */


/**
 * Make a schema optional
 */
optional = function(schema){
    return _.extend({optional: true}, schema);
};