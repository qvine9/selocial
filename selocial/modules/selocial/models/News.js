/**
 * News model
 * 
 * @type object
 */
News = config.collections.News = new Meteor.Collection("News");

/**
 * Schema for News
 * 
 * @type SimpleSchema
 */
config.schema.News = new SimpleSchema({
    title: { type: String, optional: true },
    url: { type: String, optional: true },
    domain: { type: String, optional: true },
    keywords: { type: [String], optional: true },
    date: { type: Date }
});

// Attach schema to the collection
News.attachSchema(config.schema.News);
