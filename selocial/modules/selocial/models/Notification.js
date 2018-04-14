/**
 * Notification model
 * 
 * @type object
 */
Notification = config.collections.Notification = new Meteor.Collection("Notification");

/**
 * Schema for Notification
 * 
 * @type SimpleSchema
 */
config.schema.Notification = new SimpleSchema({
    userId: { type: String },
    message: { type: String },
    type: { type: String },
    params: { type: Object, blackbox: true, optional: true },
    hasBeenDisplayed: { type: Boolean, optional: true },
    date: { type: Date }
});

// Attach schema to the collection
Notification.attachSchema(config.schema.Notification);