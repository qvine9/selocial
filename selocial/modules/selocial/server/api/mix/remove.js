Meteor.startup(function(){
    /**
     * Play a mix
     */
    Api.registerEndpoint('mix', 'remove', {
        description: "Remove a mix",
        accessTokenRequired: true,
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
            var mix = Mix.findOne({_id: params.mixId}, {fields: {userId: 1}});
            if (mix.userId !== userId) {
                throw new Meteor.Error("This is not your mix!");
            }
            
            Mix.remove({_id: params.mixId});
        }
    });
});