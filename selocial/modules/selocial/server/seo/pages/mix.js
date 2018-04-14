/**
 * Mix page
 *
 * This is the route executed when somebody requests a /mix/MIX_ID page.
 */
SeoUtils.route('/mix/:mixId', 'pages/mix', function(params, meta) {
    check(params.mixId, String);

    var mix = Mix.findOne({_id: params.mixId});
    if (!mix) {
        return {
            mix: {
                title: 'Not found!'
            }
        };
    }

    var user = User.findOne({_id: mix.userId});

    var title = 'Play ' + mix.title + ' - by ' + user.username;
    var description = mix.description;

    if (description.length > 150) {
        description = description.replace(/\s\S*$/, '...');
    }

    meta.push({name: 'title', content: title});
    meta.push({name: 'description', content: description});

    meta.push({property: 'og:url', content: Meteor.absoluteUrl() + 'mix/' + mix._id });
    meta.push({property: 'og:title', content: title});
    meta.push({property: 'og:description', content: description});
    meta.push({property: 'og:audio', content: Meteor.absoluteUrl() + 'mix/' + mix._id });
    meta.push({property: 'og:audio:type', content: 'audio/vnd.facebook.bridge' });

    meta.push({name: 'twitter:card', content: 'photo'});
    meta.push({name: 'twitter:title', content: title});
    meta.push({name: 'twitter:description', content: description});


    if (mix.video){

        if (mix.video.process){
            var videoUrl = mix.video.process.url.replace('http:', 'https:');

            meta.push({property: 'og:type', content: 'video' });
            meta.push({property: 'og:video', content: videoUrl });
            meta.push({property: 'og:video:secure_url', content: videoUrl });
            meta.push({property: 'og:video:type', content: 'video/mp4' });
            meta.push({property: 'og:video:width', content: '848' });
            meta.push({property: 'og:video:height', content: '480' });
            meta.push({property: 'og:image', content: mix.video.process.posterUrl.replace('http:', 'https:') });

            meta.push({name: 'twitter:card', content: 'player' });
            meta.push({name: 'twitter:player', content: Meteor.absoluteUrl() + 'play/' + mix._id });
            meta.push({name: 'twitter:player:stream', content: 'video/mp4' });
            meta.push({name: 'twitter:player:stream:content_type', content: 'video/mp4'}); //; codecs=&quot;avc1.42E01E1, mp4a.40.2&quot;
            meta.push({name: 'twitter:player:width', content: '848' });
            meta.push({name: 'twitter:player:height', content: '480' });
        }

    } else {

        var imageUrl = (mix.images[0].process || mix.images[0]).url.replace('http:', 'https:');

        meta.push({property: 'og:type', content: 'article' });
        meta.push({property: 'og:image', content: imageUrl });
        meta.push({property: 'og:image:width', content: '848' });
        meta.push({property: 'og:image:height', content: '480' });

        meta.push({name: 'twitter:card', content: 'photo'});
        meta.push({name: 'twitter:photo', content: imageUrl });

    }

    return {
        mix: mix,
        title: title,
        description: description
    };
});
