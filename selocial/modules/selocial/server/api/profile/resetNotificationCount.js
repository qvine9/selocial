Meteor.startup(function(){
    /**
     * Reset notification count
     */
    Api.registerEndpoint('profile', 'resetNotificationCount', {
        description: "Reset notification count",
        accessTokenRequired: true,
        params: {
        },

        sample: {
            request: null,
            response: true
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            User.update({_id: userId}, {$unset: {notificationCount: 1}});
        }
    });
});