Meteor.startup(function(){
    /**
     * Play a mix
     */
    Api.registerEndpoint('mix', 'play', {
        description: "Play a mix",
        accessTokenRequired: false,
        params: {
            mixId: {
                description: "The mix to comment on",
                schema: String
            }
        },

        sample: {
            request: "TODO",
            response: "TODO"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            Mix.update({_id: params.mixId}, {
                $inc: {playCount: 1},
                $set: { priority: new Date().getTime() }
            });
            return true;
        }
                
    });
});