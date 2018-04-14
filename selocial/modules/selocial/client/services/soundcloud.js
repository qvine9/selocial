angular.module('selocial')

/**
 * SoundCloud Api Service
 * 
 * @param {object} $q           AngularJS queue service
 * @param {object} $rootScope   root scope
 * @returns {object}
 */
.service('soundcloud', function($q, $rootScope){
    
    var soundcloudService,
        isApiLoaded = false,
        isLoadingApi = false;
    
    /**
     * Convert a track to a format known by selocial
     */
    var convertTrack = function(track){
        return {
            _id: track.id,
            title: track.title,
            author: {
                _id: track.author_id,
                username: track.user.username,
                image: track.artwork_url || track.user.avatar_url || config.profile.defaultImage
            },
            file: {
                url: track.stream_url,
                permalink: track.permalink_url,
                process: {
                    type: 'mixAudio',
                    url: track.stream_url,
                    waveformUrl: track.waveform_url,
                    duration: Math.floor(track.duration / 1000),
                    genre: track.genre,
                }
            },
            source: 'soundcloud'
        };
    };
    
    /**
     * Get Google API
     */
    var getSoundCloudApi = function(){
        return $q(function(resolve, reject){
            if (!isApiLoaded){
                if (isLoadingApi){
                    $rootScope.$on('soundcloud.api.load', function(){
                        resolve(SC);
                    });
                    return;
                }
                
                isLoadingApi = true;
                
                jQuery.getScript('https://connect.soundcloud.com/sdk/sdk-3.0.0.js', function(){
                    isApiLoaded = true;
                    
                    SC.initialize({
                        client_id: config.social.soundcloud.clientId,
                        redirect_uri: config.social.soundcloud.callbackUrl
                    });
                    
                    resolve(SC);
                    $rootScope.$broadcast('soundcloud.api.load');
                });
            } else {
                resolve(SC);
            }
        });
    };
    
    soundcloudService = {
       
        /**
         * Get the youtube API promise
         */
        getSoundCloudApi: getSoundCloudApi,
        
        /**
         * Search soundcloud
         * 
         * @param {string} keywords
         */
        search: function(keywords, limit){
            return $q(function(resolve, reject){
                limit = limit || 50;
                return getSoundCloudApi().then(function(SC){
                    SC.get('/tracks', {q: keywords, limit: limit}).then(function(tracks){
                        resolve(_.map(tracks, convertTrack));
                    }).catch(reject);
                });
            });
        },
        
        /**
         * Get the stream URL for a track
         * 
         * @param {object} track
         * @returns {string}
         */
        getStreamUrl: function(track){
            return track.file.url + '?client_id=' + config.social.soundcloud.clientId;
        }
        
    };
    return soundcloudService;
});