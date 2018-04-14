Meteor.startup(function(){
    /**
     * Edit a mix
     */
    Api.registerEndpoint('mix', 'edit', {
        description: "Edit a mix",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "Mix id",
                schema: String
            },
            musicTracks: {
                description: "Tracks details",
            },
            mix: {
                description: "Mix details",
            },
            imageIds: {
                description: "Image ids",
            },
            videoId: {
                description: "Video id",
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
            if (!params.videoId && (!params.imageIds || params.imageIds.length === 0)) {
                throw new Meteor.Error("Please upload a video or an image!");
            }

            if (!params.videoId && (!params.musicTracks || params.musicTracks.length === 0)) {
                throw new Meteor.Error("Please upload a video or add some audio tracks!");
            }

            var mixId = params.mixId;

            var mix = Mix.findOne({_id: mixId});
            if (mix.userId !== userId) {
                throw new Meteor.Error("This is not your mix!");
            }

            Mix.update({_id: mixId}, {$set:{
                title: params.mix.title,
                description: params.mix.description,
                tracks: params.musicTracks,
                images: params.imageIds ? UploadedFile.find({_id: {$in: params.imageIds}}).fetch() : null,
                video: params.videoId ? UploadedFile.findOne({_id: params.videoId}) : null,
                hashtags: Tagger.getHashtags(params.mix.title, params.mix.description),
                mentions: Tagger.getMentions(params.mix.title, params.mix.description),
                isPublic: params.mix.isPublic
            }, $unset: {cover: 1}});

            if (params.imageIds){
                UploadedFile.update({_id: {$in: params.imageIds}}, {$set: {mixId: mixId}});
            }
            if (params.videoId){
                check(params.videoId, String);
                UploadedFile.update({_id: params.videoId}, {$set: {mixId: mixId}});
            }

            return mixId;
        }
    });
});
