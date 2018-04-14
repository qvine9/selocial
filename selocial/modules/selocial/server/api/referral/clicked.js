Meteor.startup(function(){
    /**
     * Referral link clicked
     */
    Api.registerEndpoint('referral', 'clicked', {
        description: "Clicked referral link",
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
            if (userId)
                return;
            
            let update = Referral.update({
                _id: params.referralId
            }, {
                $inc: {clicks: 1},
                $set: {lastClicked: new Date()}
            });
            return !!update;
        }
    });
});