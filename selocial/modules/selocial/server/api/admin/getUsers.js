Meteor.startup(function(){
    /**
     * Edit a mix
     */
    Api.registerEndpoint('admin', 'getUsers', {
        description: "Get users",
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
            return User.find({},{sort:{createdAt: -1}}).fetch();
        }
    });
});