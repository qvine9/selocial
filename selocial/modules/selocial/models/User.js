/**
 * User model
 *
 * Proxy Meteor.users to unify the way models are handled.
 *
 * @type object
 */
User = config.collections.User = Meteor.users;

/**
 * Schema for User model's profile field
 *
 * @type SimpleSchema
 */
config.schema.UserProfile = new SimpleSchema({
    name: { type: String, optional: true },
    dateOfBirth: { type: String, optional: true },
    image: { type: String, optional: true },
    coverPhoto: { type: String, optional: true },
    sendEmailNotifications: { type: Boolean, optional: true },   // Should the user receive email notifications?
    bandSettings: { type: Object, optional: true, blackbox: true },
    age: { type: Number, optional: true },
    city: { type: String, optional: true },
    country: { type: String, optional: true },
    state: { type: String, optional: true },
    gender: { type: String, optional: true },
    privateChannel: { type: Boolean, optional: true },
    tours: { type: Object, optional: true , blackbox: true}
});

/**
 * Schema for User model
 *
 * @type SimpleSchema
 */
config.schema.User = new SimpleSchema({
    username: { type: String, optional: true },
    emails: { type: Array, optional: true },
    "emails.$": { type: Object },
    "emails.$.address": { type: String, regEx: SimpleSchema.RegEx.Email },
    "emails.$.verified": { type: Boolean },
    createdAt: { type: Date },
    profile: { type: config.schema.UserProfile, optional: true },
    services: { type: Object, optional: true, blackbox: true },
    roles: { type: [String], optional: true },
    heartbeat: { type: Date, optional: true },
    status: { type: Object, optional: true, blackbox: true },
    deleteConfirmationToken: { type: String, optional: true },
    notificationCount: { type: Number, optional: true },

    referralId: { type: String, optional: true },               // if user signed up using a referral link

    upvotes: { type: [String], optional: true },
    upvotesHistory: { type: [String], optional: true },
    following: { type: [String], optional: true },              // The user ids this user follows
    followers: { type: [String], optional: true },              // The user ids following this user
    followingHistory: { type: [String], optional: true },       // All users this user has ever followed

    followingCount: { type: Number, optional: true },
    followersCount: { type: Number, optional: true },

    timebankBalance: { type: Number, optional: true },              // The duration of the music tracks each of the user's mix can contain (+ 15 mins)
    creditBalance: { type: Number, decimal: true, optional: true }  // The credit balance a user has
});

// Attach schema to the collection
User.attachSchema(config.schema.User);

if (Meteor.isServer) {

    User.after.insert(function (userId, doc) {
        if (doc.referralId) {
            const referral = Referral.findOne(doc.referralId);
            if (referral) {
                Referral.update({_id: referral._id}, {
                    $addToSet: {registers: doc._id}
                });

                TransactionService.giveTime(referral.userId, config.transaction.referralExtraTime);
            }
        }

        if (Referral.findOne({userId}))
            return;
	
	try {
            Referral.insert({
                userId: userId,
                clicks: 0,
                createdAt: new Date(),
                registers: []
            });
        } catch (err) { console.log(err); }
    });

}
