/**
 * Uploaded file model
 * 
 * @type object
 */
UploadedFile = config.collections.UploadedFile = new Meteor.Collection("UploadedFile");

/**
 * Schema for UploadedFile
 * 
 * @type SimpleSchema
 */
config.schema.UploadedFile = new SimpleSchema({
    name: { type: String },
    originalName: { type: String },
    path: { type: String },
    size: { type: Number },
    type: { type: String },
    baseUrl: { type: String },
    url: { type: String },
    mixId: { type: String, optional: true },    // If set, the system will try to update the embedded file data in case it was saved before processing
    trackId: { type: String, optional: true },  // If set, the system will try to update the embedded file data in case it was saved before processing
    albumId: {type: String, optional: true },   // If set, the system will try to update the embedded file data in case it was saved before processing
    process: { type: Object, blackbox: true, optional: true },
    metadata: { type: Object, blackbox: true, optional: true },
    processError: { type: Boolean, optional: true },
    priority: { type: Number, optional: true }
});

// Attach schema to the collection
UploadedFile.attachSchema(config.schema.UploadedFile);