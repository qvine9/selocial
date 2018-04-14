Meteor.startup(function(){
    /**
     * Referral link prompted
     */
    Api.registerEndpoint('referral', 'prompted', {
        description: "Prompted referral link",
        accessTokenRequired: false,
        params: {
            referralId: {
                description: "referralId of the entry",
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
         * @return {boolean}
         */
        callback: function(params, userId){
            if (!userId)
                return;
            
            let update = Referral.update({
                _id: params.referralId
            }, {
                $set: {lastPrompted: new Date()}
            });
            return !!update;
        }
    });
});