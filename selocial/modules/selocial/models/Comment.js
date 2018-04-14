/**
 * Comment model
 * 
 * @type object
 */
Comment = config.collections.Comment = new Meteor.Collection("Comment");

/**
 * Schema for Comment
 * 
 * @type SimpleSchema
 */
config.schema.Comment = new SimpleSchema({
    mixId: { type: String, index: true },
    userId: { type: String },
    date: { type: Date },
    message: { type: String }
});

// Attach schema to the collection
Comment.attachSchema(config.schema.Comment);