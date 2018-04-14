/**
 * Publish the user
 */
Meteor.publish('User', function(params){
    if (!params){
        return [];
    }
    
    return User.find({
        _id: typeof(params) === 'string' ? params : {$in: params}
    }, {
        fields: {
            username: 1,
            followersCount: 1,
            notificationCount: 1,
            "profile.name": 1,
            "profile.image": 1
        }
    })
});


/**
 * Publish details of the current user
 */
Meteor.publish('me', function(userId){
    if (!userId || userId !== this.userId){
        return;
    }
    
    // User details
    var userCursor = User.find({ _id: userId }, {
        fields: {
            following: 1,
            followers: 1,
            followingCount: 1,
            followersCount: 1,
            timebankBalance: 1,
            creditBalance: 1,
            upvotes: 1,
            'services.facebook': 1,
            'services.instagram': 1,
            roles: 1
        }
    });
    
    // Notifications
    var notificationsCursor = Notification.find({
        userId: userId
    });
    
    // Return all cursors
    return [
        userCursor,
        notificationsCursor
    ];
});
