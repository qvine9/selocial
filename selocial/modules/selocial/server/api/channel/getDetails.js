Meteor.startup(function(){
    /**
     * Edit a mix
     */
    Api.registerEndpoint('channel', 'getDetails', {
        description: "Get channel details",
        accessTokenRequired: false,
        params: {
            channelName: {
                description: "Channel id",
                schema: String
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
         * @return {boolean}
         */
        callback: function(params){
            var user = User.findOne({username: {$regex: '^' + params.channelName + '$', $options: 'i'}});
            if (!user) {
                return {
                    name: params.channelName
                };
            }
            return {
                name: user.profile && user.profile.name ? user.profile.name : user.username,
                coverPhoto: user.profile ? user.profile.coverPhoto : null
            };
        }
    });
});