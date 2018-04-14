/**
 * PlayLog model
 *
 * @type object
 */
PlayLog = config.collections.PlayLog = new Meteor.Collection("PlayLog");

/**
 * Schema for PlayLog
 *
 * @type SimpleSchema
 */
config.schema.PlayLog = new SimpleSchema({
    mixId: { type: String },
    type: { type: String }, // Selocial / soundcloud
    trackId: { type: String },
    userId: { type: String, optional: true },
    createdAt: { type: Date }
});

// Attach schema to the collection
PlayLog.attachSchema(config.schema.PlayLog);

PlayLog.overridePermissions = true;
PlayLog.allow({
    insert: function(){ return true },
    update: function(){ return false },
    remove: function(){ return false }
});
