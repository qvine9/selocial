var fs = Npm.require('fs');

Meteor.startup(function(){
    /**
     * Create a mix
     */
    Api.registerEndpoint('media', 'convertSoundCloudWaveform', {
        description: "Convert SoundCloud Waveform",
        accessTokenRequired: true,
        params: {
            url: {
                description: "SoundCloud waveform URL",
                schema: String
            }
        },
        sample: {
            request: "TODO: write",
            response: "TODO: write"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var convert = function(callback){
                
                var fileName = params.url.replace(/.*\//, '');
                var filePath = config.media.uploadPath + '/' + fileName;
                var fileUrl = '/upload/' + fileName;
                
                /* */
                if (fs.existsSync(filePath)){
                    return callback(null, fileUrl);
                }
                /* */
                
                FileStorage.download(params.url, filePath);
                MediaConverter.convertSoundCloudWaveformImage(filePath, filePath, function(err){
                    if (err) {
                        return callback(null, url);
                    }
                    callback(null, fileUrl);
                });
            };
            return Meteor.wrapAsync(convert)();
        }
    });
});