var jwt = Npm.require('jsonwebtoken');

/**
 * Api class
 */
class _Api {

    /**
     * Register an API endpoint
     */
    static registerEndpoint(module, endpoint, definition){
        this.modules || (this.modules = {});
        this.modules[module] || (this.modules[module] = { endpoints: {} });
        this.modules[module].endpoints[endpoint] = definition;

        // Create meteor method
        var methodDefinition = {};
        methodDefinition[module + '_' + endpoint] = function(params){

            // Make sure the method doesn't get any extra parameters
            var passedParams = {};

            // The user id to be passed to the api endpoint
            var userId;

            // Manage access token
            if (definition.accessTokenRequired) {
                if (params.accessToken) {
                    var decodedToken = jwt.verify(params.accessToken, config.security.encryptionKey);
                    if (!decodedToken){
                        throw new Meteor.Error("Invalid access token!");
                    }
                    userId = decodedToken.userId;
                    if (! Meteor.findOne({_id: userId}, {fields: {_id: 1}})) {
                        throw new Meteor.Error("This access token belongs to a deleted user!");
                    }
                    delete(params.accessToken);
                } else {
                    userId = Meteor.userId();
                    if (!userId) {
                        throw new Meteor.Error("You are not logged in and have not provided an access token!");
                    }
                }
            } else {
                userId = Meteor.userId();
            }

            // Validate params
            for (let key in definition.params) {
                if (definition.params[key].schema) {
                    check(params[key], definition.params[key].schema);
                }
                passedParams[key] = params[key];
            }

            // Run the API endpoint
            return definition.callback.apply(this, [passedParams, userId]);
        };

        Meteor.methods(methodDefinition);
    }


}


// Export API class
Api = _Api;
