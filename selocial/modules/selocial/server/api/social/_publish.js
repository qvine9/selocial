/**
 * Publish comments of a mix
 */
Meteor.publish('mix-comments', function(mixId){
    check(mixId, String);
    return Comment.find({mixId: mixId});
});
