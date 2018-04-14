/**
 * Publish the users own referral entry
 */
Meteor.publish('my-referral', function(){
    var userId = this.userId;
    if(!userId) {
        return;
    }

    const refs = Referral.find({userId});
    if (refs.count() < 1) {
        Referral.insert({
            userId,
            clicks: 0,
            createdAt: new Date(),
            registers: []
        });
    }

    return refs;
});