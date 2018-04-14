/**
 * CreditPacks model
 *
 * @type object
 */
CreditPacks = config.collections.CreditPacks = new Meteor.Collection("CreditPacks");

/**
 * Schema for CreditPacks
 *
 * @type SimpleSchema
 */
config.schema.CreditPacks = new SimpleSchema({
    name: { type: String },
    price: { type: Number, decimal: true },
    credits: { type: Number }
});

// Attach schema to the collection
CreditPacks.attachSchema(config.schema.CreditPacks);


// Insert default credit packs
if (Meteor.isServer && !CreditPacks.find().count()){

    CreditPacks.insert({ name: "500 credits", price: 5, credits: 500 });
    CreditPacks.insert({ name: "1000 credits", price: 10, credits: 1000 });

}
