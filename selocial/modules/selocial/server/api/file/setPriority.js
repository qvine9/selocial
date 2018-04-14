Meteor.startup(function(){
    /**
     * Create a mix
     */
    Api.registerEndpoint('file', 'setPriority', {
        description: "Set the priority",
        accessTokenRequired: true,
        params: {
            fileId: {
                description: "File ID",
                schema: String
            },
            priority: {
                description: "Priority",
                schema: Number
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
            UploadedFile.update({_id: params.fileId}, {$set: {priority: params.priority}});
        }
    });
});