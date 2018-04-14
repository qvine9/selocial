Meteor.startup(function(){
    /**
     * Edit an album
     */
    Api.registerEndpoint('band', 'editAlbum', {
        description: "Edit an album",
        accessTokenRequired: true,
        params: {
            album: {
                description: "Album details",
                schema: config.schema.Album
            },
            albumId: {
                description: 'Album ID'
            }
        },

        sample: {
            request: {
                album: {
                    _id: 's3kjrh3kjrb34rh',
                    title: 'Imperial March Album',
                    artist: 'John Williams',
                    tracks: [{
                        _id: 'askhajkshjkaskjhs',
                        url: 'http://example.com/file.mp3'
                    } ]
                }
            },
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
            var album = Album.findOne({_id: params.albumId});
            if (!album) {
                throw new Meteor.Error('No album found with given ID!');
            }
            if (album.userId !== userId){
                throw new Meteor.Error("This is not your album!");
            }
            if(album.locked) {
                throw new Meteor.Error("Album is not editable after purchase!");
            }
            album = params.album;
            album._id = params.albumId;

            //
            // Album.update({_id: params.albumId}, {$set: params.album});
            // Track.update({albumId: params.albumId}, {$unset: {albumId: ''}});
            // params.album.tracks.forEach(function (t) {
            //     Track.update({_id: t._id}, {$set: {albumId: params.albumId}});
            // });

            return AlbumCreator.EditAlbum(params.album);
        }
    });
});