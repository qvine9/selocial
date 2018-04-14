Meteor.startup(function(){
    /**
     * Delete an album
     */
    Api.registerEndpoint('band', 'deleteAlbum', {
        description: "Delete an album",
        accessTokenRequired: true,
        params: {
            albumId: {
                schema: String,
                description: "Album ID"
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
            var album = Album.findOne({_id: params.albumId});
            if (album.userId !== userId){
                throw new Meteor.Error("This is not your album!");
            }
            if (album.locked) {
                // we allow user to 'remove' album if there were any purchases. but only hide from UI
                Album.update({_id: album._id}, {$set: {visible: false}});
                Track.update({albumId: album._id}, {$set: {visible: false}});
            } else {
                // we really remove the info from db for unlocked editable albums/tracks
                Album.remove({_id: album._id});
                Track.remove({albumId: album._id});
            }
            // album.tracks.forEach(function (t) {
            //     Track.update({_id: t._id}, {$unset: {albumId: ''}});
            // });
        }
    });
});