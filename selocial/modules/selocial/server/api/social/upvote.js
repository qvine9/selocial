Meteor.startup(function(){
    /**
     * Upvote
     */
    Api.registerEndpoint('social', 'upvote', {
        description: "Upvote",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "Mix id to upvote",
                schema: String
            }
        },

        sample: {
            request: "TODO",
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
            var user = User.findOne({_id: userId});
            
            if (_.contains(user.upvotes, params.mixId)) {
                // Already upvoted, downvote
                Mix.update({_id: params.mixId}, {$pull: {upvotes: userId}, $inc: {upvotesCount: -1}});
                User.update({_id: userId}, {$pull: {upvotes: params.mixId}});
            } else if (_.contains(user.upvotesHistory, params.mixId)) {
                // Upvoting again
                Mix.update({_id: params.mixId}, {$push: {upvotes: userId}, $inc: {upvotesCount: 1}});
                User.update({_id: userId}, {$push: {upvotes: params.mixId}});
            } else {
                // New upvote
                Mix.update({_id: params.mixId}, {$push: {upvotes: userId}, $inc: {upvotesCount: 1}});
                User.update({_id: userId}, {$push: {upvotes: params.mixId, upvotesHistory: params.mixId}});
                var mix = Mix.findOne({_id: params.mixId}, {fields: {userId: 1, title: 1}});
                NotificationService.notify(mix.userId, `${user.profile.name} upvoted your mix <a href="/mix/${mix._id}">${mix.title}</a>`, 'info', {'followerId': user._id });
            }
            
            return true;
        }
    });
});