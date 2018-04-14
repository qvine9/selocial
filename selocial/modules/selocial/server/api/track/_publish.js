/**
 * Publish commissions
 */
Meteor.publish('commissions', function(ids){
    if (!ids) {
        ids = Track.find({userId: this.userId}, {fields: {_id: 1}}).map(t => t._id);
        if (!ids) {
            return [];
        }
    }
    return TrackPaymentLog.find({trackId: typeof(ids) === 'string' ? ids : {$in: ids} });
});


/**
 * Purchases
 */
Meteor.publish('purchases', function(){
    return  Purchase.find({userId: this.userId});
});
