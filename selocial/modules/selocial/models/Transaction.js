/**
 * Transaction model
 * 
 * @type object
 */
Transaction = config.collections.Transaction = new Meteor.Collection("Transaction");

/**
 * Schema for Transaction
 * 
 * @type SimpleSchema
 */
config.schema.Transaction = new SimpleSchema({
    date: { type: Date },
    sourceUserId: { type: String },
    targetUserId: { type: String },
    credits: { type: Number, decimal: true, optional: true },
    time: { type: Number, optional: true },
    params: { type: Object, optional: true, blackbox: true }
});

// Attach schema to the collection
Transaction.attachSchema(config.schema.Transaction);