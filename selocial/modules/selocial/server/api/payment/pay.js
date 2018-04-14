Meteor.startup(function(){
    /**
     * Payment transaction
     */
    Api.registerEndpoint('payment', 'pay', {
        description: "Mark a commission payed",
        accessTokenRequired: true,
        params: {
            trackId: {
                description: "Track Id",
            },
            name: {
                description: "Name",
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
            TrackPaymentLog.update({
                trackId: params.trackId,
                recipient: params.name
            }, {$set: {payed: true}}, {multi: true});
        }
    });
});
