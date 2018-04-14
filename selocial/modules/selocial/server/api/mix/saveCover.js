var fs = require("fs"),
    md5 = require('md5');

Meteor.startup(function(){
    /**
     * Save mix cover
     */
    Api.registerEndpoint('mix', 'saveCover', {
        description: "Save cover",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "Mix Id",
                type: String
            },
            image: {
                description: "Image",
                type: String
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
            var image = params.image.substr(22);
            var fileName = md5(image) + ".png";
            var localFilePath = config.media.uploadPath + "/" + fileName;
            fs.writeFile(localFilePath, image, 'base64', Meteor.bindEnvironment(function(err) {
                if (!err){
                    FileStorage.save(localFilePath, "images/" + fileName, function(err, url){
                        if (!err && url){
                            Mix.update({_id: params.mixId}, {$set: {cover: url}});
                        }
                    });
                }
            }));
            
        }
    });
});