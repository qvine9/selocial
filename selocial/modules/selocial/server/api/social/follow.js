Meteor.startup(function(){
    /**
     * Follow a user
     */
    Api.registerEndpoint('social', 'follow', {
        description: "Follow a user",
        accessTokenRequired: true,
        params: {
            userId: {
                description: "User id to follow",
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
            if (_.contains(user.following, params.userId)) {
                // Already following, unfollow
                User.update({_id: userId}, {$pull: {following: params.userId}, $inc: {followingCount: -1}});
                User.update({_id: params.userId}, {$pull: {followers: userId}, $inc: {followersCount: -1}});
                NotificationService.notify(params.userId, `${user.profile.name} is no longer following you`, 'info', {'followerId': user._id });
            } else if (_.contains(user.followingHistory, params.userId)) {
                // Following again
                User.update({_id: userId}, {$push: {following: params.userId}, $inc: {followingCount: 1}});
                User.update({_id: params.userId}, {$addToSet: {followers: userId}, $inc: {followersCount: 1}});
                NotificationService.notify(params.userId, `${user.profile.name} is following you again`, 'info', {'followerId': user._id});
            } else {
                // New follower
                User.update({_id: userId}, {$push: {following: params.userId, followingHistory: params.userId}, $inc: {followingCount: 1}});
                User.update({_id: params.userId}, {$addToSet: {followers: userId}, $inc: {followersCount: 1}});
                TransactionService.giveTime(params.userId, config.transaction.newFollowerExtraTime);
                NotificationService.notify(params.userId, `${user.profile.name} is following you. You got ${config.transaction.newFollowerExtraTime} extra seconds in your timebank`, 'info', {'followerId': user._id });
            }
            return true;
        }
    });
});