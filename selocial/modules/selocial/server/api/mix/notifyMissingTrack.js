Meteor.startup(function(){
    /**
     * Notify a user about a missing track
     */
    Api.registerEndpoint('mix', 'notifyMissingTrack', {
        description: "Notify user about a missing track",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "Mix ID",
                schema: String
            },
            trackIndex: {
                description: "Track index"
            }
        },

        sample: {
            request: "TODO",
            response: "TODO"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var mix = Mix.findOne({_id: params.mixId});
            if (!mix){
                throw new Meteor.Error("Mix not found!");
            }
            var track = mix.tracks[params.trackIndex];
            if (!track || track.missingNotified){
                return false;
            }
            
            var update = {};
            update["tracks." + params.trackIndex + ".missingNotified"] = true;
            Mix.update({_id: params.mixId},{$set: update});
            
            var idx = params.trackIndex + 1;
            NotificationService.notify(mix.userId, `Track #${idx} from your mix <a href="/mix/${mix._id}">${mix.title}</a> may have been deleted by original uploader! Edit song and update!`);
            
            return true;
        }
    });
});
