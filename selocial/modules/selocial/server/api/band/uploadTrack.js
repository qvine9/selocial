Meteor.startup(function(){
    /**
     * Upload a track
     */
    Api.registerEndpoint('band', 'uploadTrack', {
        description: "Upload a track",
        accessTokenRequired: true,
        params: {
            track: {
                description: "Track details",
                schema: config.schema.Track
            }
        },

        sample: {
            request: {
                track: {
                    title: 'Imperial March',
                    artist: 'John Williams',
                    file: {
                        _id: 'askhajkshjkaskjhs',
                        url: 'http://example.com/file.mp3'
                    } 
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
            params.track.userId = userId;
            params.track.date = new Date();
            
            Track.checkPercentages(params.track);
            
            var trackId = Track.insert(params.track);
            if (params.track.file._id) {
                UploadedFile.update({_id: params.track.file._id}, {$set: {trackId: trackId}});
            }
            return trackId;
        }
    });
});