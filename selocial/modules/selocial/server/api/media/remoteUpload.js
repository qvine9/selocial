var fs = Npm.require('fs'),
    md5 = Npm.require('md5'),
    mime = Npm.require('mime');

Meteor.startup(function(){
    /**
     * Create a mix
     */
    Api.registerEndpoint('media', 'remoteUpload', {
        description: "Upload from a remote URL",
        accessTokenRequired: true,
        params: {
            url: {
                description: "URL",
                schema: String
            },
            process: {
                description: "Process",
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
         * @return {boolean}
         */
        callback: function(params){
            return FileStorage.remoteUpload(params.url, params.process);
        }
    });
});