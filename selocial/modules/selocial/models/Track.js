/**
 * Track model
 *
 * @type object
 */
Track = config.collections.Track = new Meteor.Collection("Track");

/**
 * Check for proper track percentages
 */
Track.checkPercentages = function(track){

    var totalPercent = 0;

    var processPercent = function(percent){
        if (typeof(percent) === 'string'){
            percent = parseInt(percent);
        }
        if (percent < 0 || percent > 100){
            throw new Meteor.Error("Wrong percentage: " + percent);
        }
        totalPercent += percent;
        if (totalPercent > 100){
            throw new Meteor.Error("Total percentage over 100!");
        }
    };

    // Check contributors and publishers
    _.each(track.contributors, function(contrib){ processPercent(contrib.percent); });

    totalPercent = 0;

    _.each(track.publishers, function(publisher){ processPercent(publisher.percent); });

    totalPercent = 0;

    _.each(track.mechanicals, function(mechanical){ processPercent(mechanical.percent); });
}


/**
 * Schema for Track
 *
 * @type SimpleSchema
 */
config.schema.Track = new SimpleSchema({
    title: { type: String },
    artist: { type: String },
    releaseType: { type: String },
    catalogId: { type: String, optional: true },
    recordLabel: { type: String, optional: true },
    releaseDate: { type: Date, optional: true },
    contributors: { type: [Object], blackbox: true, optional: true },
    publishers: { type: [Object], blackbox: true, optional: true },
    mechanicals: { type: [Object], blackbox: true, optional: true },
    genres: { type: [String], optional: true },
    emotions: { type: [String], optional: true },
    file: { type: Object, blackbox: true },
    userId: { type: String, optional: true, index: true },
    date: { type: Date, optional: true },
    purchasable: { type: Boolean, optional: true },
    albumId: { type: String, optional: true },
    albumTitle: { type: String, optional: true },
    locked: { type: Boolean, optional: true},
    visible: {type: Boolean, optional: true},
    originalTrack: {type: String, optional: true}, //ID of original track
    price: { type: Number, decimal: true, optional: true } // Price of the track IN CREDITS!!!
});

// Attach schema to the collection
Track.attachSchema(config.schema.Track);
