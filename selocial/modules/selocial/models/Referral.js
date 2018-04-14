/**
 * Referral model
 *
 * @type object
 */
Referral = config.collections.Referral = new Meteor.Collection("Referral");

/**
 * Schema for Referral
 *
 * @type SimpleSchema
 */
config.schema.Referral = new SimpleSchema({
    userId: { type: String, unique: true },
   	clicks: { type: Number },
    registers: { type: [String] },
    createdAt: { type: Date, optional: true },
    lastClicked: { type: Date, optional: true },
    lastPrompted: { type: Date, optional: true }
});

// Attach schema to the collection
Referral.attachSchema(config.schema.Referral);