Meteor.startup(function(){
    /**
     * Search for tracks
     */
    Api.registerEndpoint('search', 'users', {
        description: "Search for user",
        accessTokenRequired: true,
        params: {
            keywords: {
                description: "Keywords",
                schema: String
            }
        },

        sample: {
            request: {
                keywords: "john"
            },
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
            return User.find({ 
                username: {$regex: params.keywords, $options: 'i'} 
            }, {fields: {username: 1, profile: 1, timebankBalance: 1}, limit: 10}).fetch();
        }
    });
});