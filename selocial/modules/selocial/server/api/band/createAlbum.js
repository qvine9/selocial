Meteor.startup(function(){
    /**
     * Create an album
     */
    Api.registerEndpoint('band', 'createAlbum', {
        description: "Create an album",
        accessTokenRequired: true,
        params: {
            album: {
                description: "Album details",
                schema: config.schema.Album
            }
        },

        sample: {
            request: {
                album: {
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
            params.album.userId = userId;
            params.album.date = new Date();
            return AlbumCreator.CreateAlbum(params.album);
        }

    });
});