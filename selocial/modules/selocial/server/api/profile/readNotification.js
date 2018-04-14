Meteor.startup(function(){
    /**
     * Enable band mode
     */
    Api.registerEndpoint('profile', 'readNotification', {
        description: "Read notification",
        accessTokenRequired: true,
        params: {
            notificationId: {
                description: "Notification Id",
                schema: String
            }
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
            Notification.update({_id: params.notificationId}, {$set: {hasBeenDisplayed: true}});
        }
    });
});