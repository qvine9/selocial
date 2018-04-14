var usernames = {};

Meteor.users.find({},{username: 1}).observeChanges({
    added: function (id, user) {
        if (user.username)
            usernames[id] = user.username;
    },
    changed: function(id, fields){
        if (fields.username)
            usernames[id] = fields.username;
    },
    removed: function(id) {
        delete(usernames[id])
    }
});

var userChannelRoutes = Picker.filter(function(req, res) {
    var m = /^\/([^\/]+)$/.exec(req.url);
    if (m){
        var username = m[1],
            found = false;
        for (var id in usernames){
            if (usernames[id] === username) {
                return true;
            }
        }
    }
    return false;
});

userChannelRoutes.route('/:username', function(params, req, res, next) {
    let meta = [];
    let viewParams = process(params, meta);
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    res.end(SeoUtils.render('pages/userChannel', viewParams, meta));
    
    function process(params, meta){
        check(params.username, String);

        var user = User.findOne({username: params.username});
        if (!user) {
            return {
                user: {
                    title: 'anonymous'
                }
            };
        }

        var title = user.username + '\'s channel';
        var description = 'Play music mixes and videos uploaded by ' + user.username;

        meta.push({name: 'title', content: title});
        meta.push({name: 'description', content: description});

        meta.push({property: 'og:url', content: Meteor.absoluteUrl() + user.username });
        meta.push({property: 'og:title', content: title});
        meta.push({property: 'og:description', content: description});

        meta.push({name: 'twitter:card', content: 'photo'});
        meta.push({name: 'twitter:title', content: title});
        meta.push({name: 'twitter:description', content: description});

        var mix = Mix.findOne({userId: user._id, "images.0.process.url": {$regex: /s3/}}, {sort: {date: -1}});
        
        if (mix){
            if (mix.video){

                var videoUrl = mix.video.process.url.replace('http:', 'https:');

                meta.push({property: 'og:type', content: 'video' });
                meta.push({property: 'og:video', content: videoUrl });
                meta.push({property: 'og:video:secure_url', content: videoUrl });
                meta.push({property: 'og:video:type', content: 'video/mp4' });
                meta.push({property: 'og:video:width', content: '848' });
                meta.push({property: 'og:video:height', content: '480' });
                meta.push({property: 'og:image', content: mix.video.process.posterUrl.replace('http:', 'https:') });

                meta.push({name: 'twitter:card', content: 'player'});
                meta.push({name: 'twitter:player', content: Meteor.absoluteUrl() + 'play/' + mix._id });
                meta.push({name: 'twitter:player:stream', content: videoUrl});
                meta.push({name: 'twitter:player:stream:content_type', content: 'video/mp4'}); //; codecs=&quot;avc1.42E01E1, mp4a.40.2&quot;
                meta.push({name: 'twitter:player:width', content: '848' });
                meta.push({name: 'twitter:player:height', content: '480' });

            } else {

                var imageUrl = (mix.images[0].process || mix.images[0]).url.replace('http:', 'https:');
                if (imageUrl)

                meta.push({property: 'og:type', content: 'article' });
                meta.push({property: 'og:image', content: imageUrl });
                meta.push({property: 'og:image:width', content: '848' });
                meta.push({property: 'og:image:height', content: '480' });

                meta.push({name: 'twitter:image', content: imageUrl });

            }
        }

        return {
            user: user,
            title: title,
            description: description
        };
    }
});
