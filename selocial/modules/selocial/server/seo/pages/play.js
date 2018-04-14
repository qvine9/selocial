Picker.route('/play/:mixId', function(params, req, res, next) {
    check(params.mixId, String);
    
    var mix = Mix.findOne({_id: params.mixId})
    
    if (mix.video) {
        var html = Assets.getText('seo/pages/play.html')
        html = html
                .replace('%%URL%%', mix.video.process.url.replace('http:', 'https:'))
                .replace('%%POSTERURL%%', mix.video.process.posterUrl.replace('http:', 'https:'));
    } else {
        html = '';
    }
    
    res.end(html);
});
