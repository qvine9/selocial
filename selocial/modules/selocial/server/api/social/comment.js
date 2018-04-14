Meteor.startup(function(){
    /**
     * Comment on a mix
     */
    Api.registerEndpoint('social', 'comment', {
        description: "Comment on a mix",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "The mix to comment on",
                schema: String
            },
            message: {
                description: "Comment message",
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
            var mix = Mix.findOne({_id: params.mixId}),
                user = User.findOne({_id: userId}, {fields: {"profile.name": 1}});
            
            Comment.insert({
                mixId: params.mixId,
                userId: userId,
                date: new Date(),
                message: params.message
            });
            
            Mix.update({_id: mix._id}, {
                $inc: {
                    commentsCount: 1,
                },
                $set: {
                    priority: new Date().getTime()  
                }
            });
            
            if (mix.userId !== userId){
                TransactionService.giveTime(mix.userId, config.transaction.commentExtraTime, {
                    action: 'comment',
                    mix: params.mixId
                });

                NotificationService.notify(mix.userId, `${user.profile.name} commented on your mix <a href="/mix/${mix._id}">${mix.title}</a>. You have earned ${config.transaction.commentExtraTime} seconds.`, 'info', {'followerId': user._id });
            }
            return true;
        }
    });
});