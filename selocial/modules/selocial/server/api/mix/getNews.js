Meteor.startup(function(){
    
    const md5 = require('md5');

    
    /**
     * Get news
     */
    Api.registerEndpoint('mix', 'getNews', {
        description: "Get a mix",
        accessTokenRequired: true,
        params: {
            mixId: {
                description: "Mix Id",
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
            
            var mix = Mix.findOne({_id: params.mixId});
            if (mix){
                
                var keywords = [];
                
                var searchTitle = mix.title;
                
                if (mix.tracks && mix.tracks.length){
                    searchTitle = mix.tracks.map(function(track){
                        return track.title.replace(/\s?[-(].*/, '');
                    }).join(' ');
                }
                
                _.each(searchTitle.split(/\W+/), function(word){
                    if (word.length > 3) {
                        keywords.push(word);
                    }
                });
                
                var existingNews = News.find({keywords: {$in: keywords}}, {fields: {url: 1, title: 1, domain: 1}}).fetch();
                
                if (existingNews.length > 2) {
                    return existingNews;
                }
                
                var q = '-site:youtube.com -site:soundcloud.com -site:billboard.com -porn -nude -tits -pussy ' + keywords.join(' ') + ' music';
                var response = EJSON.parse( 
                        HTTP.get("https://www.googleapis.com/customsearch/v1?cx=006157803283133787912%3A_ca2zgoe5fe&key=" + encodeURIComponent(config.google.serverKey) + "&q=" + encodeURIComponent(q), {
                            headers: {
                                Referer: 'http://selocial.com/ '
                            }
                        }).content
                    );
                if (response.items){
                    _.each(response.items, function(news){
                        var newsItem = {
                            _id: md5(news.url),
                            url: news.link,
                            title: news.htmlTitle,
                            domain: news.displayLink
                        };
                        
                        if (!News.findOne({_id: newsItem._id}, {fields: {_id: 1}})) {
                            News.insert(_.extend({
                                date: new Date,
                                keywords: keywords
                            }, newsItem));
                        }
                        
                        existingNews.push(newsItem);
                    });
                }
                
                return existingNews;
            }
            
            return [];
        }
    });
});