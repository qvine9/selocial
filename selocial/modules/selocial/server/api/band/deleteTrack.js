Meteor.startup(function(){
    /**
     * Delete a track
     */
    Api.registerEndpoint('band', 'deleteTrack', {
        description: "Delete a track",
        accessTokenRequired: true,
        params: {
            trackId: {
                schema: String,
                description: "Track ID"
            }
        },

        sample: {
            request: 'TODO: write sample',
            response: "undefined"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var track = Track.findOne({_id: params.trackId});
            if (track.userId !== userId){
                throw new Meteor.Error("This is not your track!");
            }
            if (track.locked) {
                // Track.update({_id: track._id}, {$set: {visible: false}});
                throw new Meteor.Error('Track was purchased by someone. Can\' delete it!');
            } else {
                Track.remove({_id: track._id});
            }

            Mix.find({"tracks._id": track._id}).forEach(function (mix) {
                var idx = _.indexOf(_.pluck(mix.tracks, '_id'), track._id);
                if (idx >= 0) {
                    mix.tracks.splice(idx, 1);
                }
                Mix.update({_id: mix._id}, {$set: {tracks: mix.tracks}});

                NotificationService.notify(mix.userId, `Track #${idx + 1} from your mix <a href="/mix/${mix._id}">${mix.title}</a> has been deleted!`);

            });

            var album = Album.findOne({_id: track.albumId});
            if (album.locked) {
                //?? it shouldn't be possible to be here. all the tracks in locked album should be locked as well.
                throw new Meteor.Error('Error trying to delete part of locked album!');
            }
            var idx = _.indexOf(_.pluck(album.tracks, '_id'), track._id);
            console.log('track found at index ' + idx);
            let duration = 0;
            if (idx >= 0) {
                album.tracks.splice(idx, 1);
                album.tracks.forEach(function (t) {
                    duration += t.file.metadata.duration;
                });
            }
            if (!album.tracks || album.tracks.length == 0) {
                // we're removing album if last track was removed
                Album.remove({_id: album._id});
                NotificationService.notify(userId, `Track ${track.title} from your album ${album.title} has been deleted! The album has been deleted as empty.`);
            } else {
                Album.update({_id: album._id}, {$set: {tracks: album.tracks, duration: duration}});
                NotificationService.notify(userId, `Track ${track.title} from your album <a href="/my-albums/album/${album._id}">${album.title}</a> has been deleted!`);
            }


        }
    });
});