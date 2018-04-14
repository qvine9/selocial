/**
 * Embed Mix
 */
SeoUtils.route('/embed-channel/:channelId', 'pages/channel', function(params, meta) {
    check(params.channelId, String);
    return {
        bodyClass: 'embedPlayer'
    };
});