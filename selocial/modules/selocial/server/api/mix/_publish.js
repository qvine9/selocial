/**
 * Publish the users own mixes
 */
Meteor.publish('Mix', function(ids){
    if (!ids) return [];
    return Mix.find({_id: typeof(ids) === 'string' ? ids : {$in: ids} });
});
