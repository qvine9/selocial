Meteor.startup(function(){
    /**
     * Create a mix
     */
    Api.registerEndpoint('mix', 'create', {
        description: "Create a mix",
        accessTokenRequired: true,
        params: {
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

            var mixId = Mix.insert({
                title: params.mix.title,
                description: params.mix.description,
                tracks: params.musicTracks,
                images: params.imageIds ? UploadedFile.find({_id: {$in: params.imageIds}}, {sort: {priority: 1}}).fetch() : null,
                video: params.videoId ? UploadedFile.findOne({_id: params.videoId}) : null,
                userId: userId,
                date: new Date(),
                commentsCount: 0,
                upvotesCount: 0,
                playedCount: 0,
                hashtags: Tagger.getHashtags(params.mix.title, params.mix.description),
                mentions: Tagger.getMentions(params.mix.title, params.mix.description),
                priority: new Date().getTime(),
                isPublic: params.mix.isPublic
            });

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
