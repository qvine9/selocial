/**
 * Publish the users own tracks
 */
Meteor.publish('my-tracks', function(){
    var userId = this.userId;
    if(!userId) {
        return;
    }
    return Track.find({userId: userId, visible: {$ne: false}});
});

Meteor.publish('my-non-album-tracks', function() {
    var userId = this.userId;
    if(!userId) {
        return;
    }
    return Track.find({userId: userId, albumId: null, visible: {$ne: false}});
});

Meteor.publish('my-albums', function () {
    var userId = this.userId;
    if (!userId) {
        return;
    }
    return Album.find({userId: userId, visible: {$ne: false}});
});

Meteor.publish('album-titles', function () {
    return Album.find({}, {_id: 1, title: 1});
});

/**
 * Publish a track
 */
Meteor.publish('tracks', function(ids){
    return Track.find({_id: {$in : ids}, visible: {$ne: false}});
});