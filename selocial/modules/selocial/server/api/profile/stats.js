Meteor.startup(function(){
    /**
     * Get profile statistics
     */
    Api.registerEndpoint('profile', 'stats', {
        description: "Get Profile Statistics",
        accessTokenRequired: true,
        params: {},

        sample: {
            request: null,
            response: true
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {object}
         */
        callback: function(params, userId){
            const data = {
                tracksCount: Track.find({userId}, {fields: {_id: 1}}).count(),
                tracksInMix: getTracksInMix(userId)
            };        

            return data;
        }
    });
});

const getTracksInMix = (userId) => {
    const aggregatedMixResult = Mix.aggregate([{
        $unwind: "$tracks"
    }, {
        $match: {
            'tracks.userId': userId,
            'userId': {$ne: userId}
        }
    }, {
        $group: {
            _id: "$tracks._id",
            mixCount: {$sum: 1}
        }        
    }, {
        $sort: {
            mixCount: -1
        }
    }, {
        $limit: 5
    }]);

    const trackIds = _.pluck(aggregatedMixResult, '_id'),
        tracks = Track.find({_id: {$in: trackIds}}, {fields: {_id: 1, title: 1}}).fetch();

    const aggregatedPlayResult = PlayLog.aggregate([{
        $match: {
            trackId: {$in: trackIds}
        }
    }, {
        $group: {
            _id: '$trackId',
            playCount: {$sum: 1}
        }
    }]);

    const tracksWithCount = _.map(tracks, (track) => {
        const finder = {_id: track._id};
        const mix = _.findWhere(aggregatedMixResult, finder);
        const play = _.findWhere(aggregatedPlayResult, finder);

        track.mixCount = mix ? mix.mixCount : 0;
        track.playCount = play ? play.playCount : 0;

        return track;
    });

    return tracksWithCount;
};