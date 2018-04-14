Meteor.startup(function(){
    /**
     * Get a mix
     */
    Api.registerEndpoint('track', 'purchases', {
        description: "Get purchased tracks",
        accessTokenRequired: true,
        params: {
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
            var ids = Purchase.find({userId: userId}).map(p => p.trackId);
            if (!ids) return [];
            return Track.find({_id: {$in: ids}}, {sort: {title: 1}}).fetch();
        }
    });
});
