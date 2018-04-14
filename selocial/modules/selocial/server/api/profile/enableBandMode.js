Meteor.startup(function(){
    /**
     * Enable band mode
     */
    Api.registerEndpoint('profile', 'enableBandMode', {
        description: "Enable band mode",
        accessTokenRequired: true,
        params: {},

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
            User.update({_id: userId}, {$set: {roles: ['band']}});
            
            TransactionService.giveTime(userId, config.transaction.bandModeExtraTime, {
                action: 'bandMode'
            });
            
            return true;
        }
    });
});