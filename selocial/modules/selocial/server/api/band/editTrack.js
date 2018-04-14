Meteor.startup(function(){
    /**
     * Upload a track
     */
    Api.registerEndpoint('band', 'editTrack', {
        description: "Edit a track",
        accessTokenRequired: true,
        params: {
            track: {
                description: "Track details"
            }
        },

        sample: {
            request: 'TODO: write sample',
            response: "askjhakjshkajs (trackId)"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var track = Track.findOne({_id: params.track._id});
            if (track.userId !== userId){
                throw new Meteor.Error("This is not your track!");
            }
            if (track.locked) {
                throw new Meteor.Error("Track is not editable after purchase!");
            }
            delete(params.track._id);
            check(params.track, config.schema.Track);
            
            Track.checkPercentages(params.track);
            
            Track.update({_id: track._id}, {$set: params.track});

            Album.find({'tracks._id': track._id}).forEach(function (album) {
                var ids = _.pluck(album.tracks, '_id');
                var idx = ids.indexOf(track._id);
                var duration = 0;
                if (idx >= 0) {
                    album.tracks[idx] = params.track;
                    album.tracks.forEach(function (t) {
                        duration += t.duration;
                    });
                    Album.update({_id: album._id}, {$set: {tracks: album.tracks, duration: duration}});
                }
            });

            return track._id;
        }
    });
});