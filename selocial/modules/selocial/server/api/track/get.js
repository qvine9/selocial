Meteor.startup(function(){
    /**
     * Get a mix
     */
    Api.registerEndpoint('track', 'get', {
        description: "Get a track",
        accessTokenRequired: false,
        params: {
            trackId: {
                description: "Track Id",
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
            return Track.findOne({_id: params.trackId});
        }
    });
});
