Picker.route('/playlog/:from/:till', function(params, req, res, next) {

    res.setHeader('Content-type', 'text/csv;charset=utf-8');
    res.setHeader('Content-disposition', 'attachment;filename=selocial-play-log.csv');

    res.write('"Date","Source","MixId","TrackId","Artist","Title"\n');

    var mixes = {};

    PlayLog.find({
        createdAt: {
            $gte: moment(params.from, 'YYYY-MM-DD').toDate(),
            $lte: moment(params.till, 'YYYY-MM-DD').toDate()
        }
    }, {sort: {createdAt: 1}}).forEach(function(playLog){
        var mix = mixes[playLog.mixId];
        if (!mix){
            mix = Mix.findOne({_id: playLog.mixId});
            if (!mix){
                return;
            }
            mixes[mix._id] = mix;
        }

        var track = _.find(mix.tracks, function(track){ return track._id == playLog.trackId; });

        if (track){
            var row = JSON.stringify([
                moment(playLog.createdAt).format('MM/DD/YYYY'),
                playLog.type,
                mix._id,
                track._id,
                track.artist || (track.author && track.author.username) || 'unknown',
                track.title]);
            res.write(row.substr(1, row.length-2) + "\n");
        }
    });

    res.end('');
});
