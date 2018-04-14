Meteor.startup(function(){
    /**
     * Get a mix
     */
    Api.registerEndpoint('mix', 'get', {
        description: "Get a mix",
        accessTokenRequired: false,
        params: {
            mixId: {
                description: "Mix Id",
                type: String
            }
        },
        sample: {
            request: "TODO: write",
            response: "TODO: write"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            return Mix.findOne({_id: params.mixId});
        }
    });
});
