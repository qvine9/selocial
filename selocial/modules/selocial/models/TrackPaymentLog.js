/**
 * TrackPaymentLog model
 *
 * @type object
 */
TrackPaymentLog = config.collections.TrackPaymentLog = new Meteor.Collection("TrackPaymentLog");

/**
 * Schema for Track
 *
 * @type SimpleSchema
 */
config.schema.TrackPaymentLog = new SimpleSchema({
    mixId: { type: String, optional: true },
    trackId: { type: String, optional: true },
    payerId: { type: String },
    recipient: { type: String },
    percentage: { type: String },
    amount: { type: Number, decimal: true },
    reason: { type: String },
    date: { type: Date },
    payed: { type: Boolean, optional: true }
});

// Attach schema to the collection
TrackPaymentLog.attachSchema(config.schema.TrackPaymentLog);
