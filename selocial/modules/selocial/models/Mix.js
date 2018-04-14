/**
 * Mix model
 * 
 * @type object
 */
Mix = config.collections.Mix = new Meteor.Collection("Mix");

/**
 * Schema for Mix
 * 
 * @type SimpleSchema
 */
config.schema.Mix = new SimpleSchema({
    title: { type: String },
    description: { type: String },
    tracks: { type: [Object], blackbox: true, optional: true },
    images: { type: [Object], blackbox: true, optional: true },
    cover: { type: String, optional: true },
    video: { type: Object, blackbox: true, optional: true },
    userId: { type: String, optional: true, index: true },
    isPublic: { type: Boolean, optional: true, index: true },
    date: { type: Date, optional: true },

    hashtags: { type: [String], optional: true },
    mentions: { type: [String], optional: true },
    
    upvotes: { type: [String], optional: true },
    upvotesCount: { type: Number, optional: true },
    playCount: { type: Number, optional: true },
    commentsCount: { type: Number, optional: true },
    
    priority: { type: Number, optional: true }
});

// Attach schema to the collection
Mix.attachSchema(config.schema.Mix);
