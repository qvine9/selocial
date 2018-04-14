/**
 * Purchase model
 *
 * @type object
 */
Purchase = config.collections.Purchase = new Meteor.Collection("Purchase");

/**
 * Schema for Track
 *
 * @type SimpleSchema
 */
config.schema.Purchase = new SimpleSchema({
    trackId: { type: String },
    userId: { type: String },
    amount: { type: Number, decimal: true },
    date: { type: Date },
    track: { type: Object, blackbox: true, optional: true }
});

// Attach schema to the collection
Purchase.attachSchema(config.schema.Purchase);
