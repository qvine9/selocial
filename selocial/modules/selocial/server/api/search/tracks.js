Meteor.startup(function(){
    /**
     * Search for tracks
     */
    Api.registerEndpoint('search', 'tracks', {
        description: "Search for tracks",
        accessTokenRequired: true,
        params: {
            keywords: {
                description: "Keywords",
                schema: String
            },
            ownTracksOnly: {
                description: "Own tracks only",
                schema: Boolean
            }
        },

        sample: {
            request: {
                keywords: "I love rock-n-roll"
            },
            response: [
                { _id: "asuazsduzausid", title: "I Love Rock'n'Roll" }
            ]
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var filter = {
                $or: [
                    { title: {$regex: params.keywords, $options: 'i'} },
                    { artist: {$regex: params.keywords, $options: 'i'} }
                ]
            };
            if (params.ownTracksOnly) {
                filter.userId = userId;
            }
            return Track.find(filter).fetch();
        }
    });
});