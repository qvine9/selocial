Meteor.startup(function(){
    /**
     * Get a mix stream
     */
    Api.registerEndpoint('mix', 'getStream', {
        description: "Get a mix stream",
        accessTokenRequired: false,
        params: {
            streamName: {
                description: "Stream name",
                type: String
            },
            streamParams: {
                description: "Stream params"
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
            var filter = {
                    isPublic: true
                },
                options = {
                    sort: { date: -1 },
                    limit: 300,
                    fields: {
                        _id: 1,
                        userId: 1,
                        cover: 1,
                        video: 1,
                        tracks: 1,
                        title: 1,
                        description: 1
                    }
                };
            
            switch (params.streamName){
                case 'my-mixes':
                    if (!userId) return [];
                    filter = {userId: userId};
                    break;
                
                case 'most-active-mixes':
                    options.sort = {priority: -1};
                    break;
                
                case 'channel-mixes':
                    check(params.streamParams.username, String);
                    var user = User.findOne({username: {$regex: '^' + params.streamParams.username + '$', $options: 'i'}});
                    if (!user) {
                        return [];
                    } else if (user._id === userId){
                        filter = { userId: user._id };
                    } else {
                        filter = { userId: user._id, isPublic: true };
                    }
                    break;
                    
                case 'tagged-mixes':
                    check(params.streamParams.tag, String);
                    filter.hashtags = params.streamParams.tag;
                    break;
                    
                case 'search-mixes':
                    check(params.streamParams.keyword, String);
                    filter.$or = [
                        {title: {$regex: params.streamParams.keyword, $options: 'i' }},
                        {description: {$regex: params.streamParams.keyword, $options: 'i' }},
                        {'tracks.title': {$regex: params.streamParams.keyword, $options: 'i' }}
                    ];
                    break;
        
                case 'followers':
                    if (!userId) return [];
                    var user = User.findOne({_id: userId});
                    if (!user.followers) {
                        return [];
                    }
                    filter = { userId: {$in: user.followers}, isPublic: true };
                    break;
    
                case 'following':
                    if (!userId) return [];
                    var user = User.findOne({_id: userId});
                    if (!user.following) {
                        return [];
                    }
                    filter = { userId: {$in: user.following}, isPublic: true };
                    break;
    
                case 'single-mix':
                    filter = {_id: params.streamParams.mixId};
                    break;
            }
            
            return Mix.find(filter, options).fetch();
        }
    });
});
