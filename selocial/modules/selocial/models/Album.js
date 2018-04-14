/**
 * Album model
 *
 * @type object
 */
Album = config.collections.Album = new Meteor.Collection("Album");

/**
 * Schema for Track
 *
 * @type SimpleSchema
 */
config.schema.Album = new SimpleSchema({
    title: { type: String },
    artist: { type: String },
    releaseType: { type: String },
    catalogId: { type: String, optional: true },
    recordLabel: { type: String, optional: true },
    releaseDate: { type: Date, optional: true },
    genres: { type: [String], optional: true },
    emotions: { type: [String], optional: true },
    userId: { type: String, optional: true, index: true },
    date: { type: Date, optional: true },
    purchasable: { type: Boolean, optional: true },
    images: {type: [Object], blackbox: true, optional: true},
    tracks: {type: [Object], blackbox: true},
    file: {type: [Object], blackbox: true, optional: true},
    duration: {type: Number, optional: true},
    locked: {type: Boolean, optional: true},
    visible: {type: Boolean, optional: true},
    price: { type: Number, decimal: true, optional: true } // Price of the album IN CREDITS!!!
});

// Attach schema to the collection
Album.attachSchema(config.schema.Album);
