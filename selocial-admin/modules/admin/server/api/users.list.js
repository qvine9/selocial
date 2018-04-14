Meteor.methods({
    users_list: function(){
        var users = Meteor.users.find().fetch();
        users.forEach(function(user){
            var mixes = Mix.find({userId: user._id}, {fields: {playCount: 1}}).fetch();
            user.mixes = mixes.length;
            user.playCount = 0;
            _.each(mixes, function(mix){
                if (mix.playCount){
                    user.playCount += mix.playCount;
                }
            });
            user.tracks = Track.find({userId: user._id}).count();
        });
        return users;
    }
})