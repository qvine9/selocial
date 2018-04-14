/**
 * Notify service
 */
angular.module('selocial').service('mixStream', function(api, error, mediaPlayer){
    
    var nextMixStreamId = 1;
    
    /**
     * Mix stream class
     */
    class MixStream {
        
        /**
         * Create mix stream
         */
        constructor(page, streamName, streamParams){
            this.id = 'mixStream' + (nextMixStreamId++);
            this.loadedMixIds = [];
            this.isLoading = true;
            this.isEmpty = false;
            this.page = page;
            this.users = [];
            
            api('mix.getStream', {streamName: streamName, streamParams: streamParams}).then((mixes) => {
                this.mixes = mixes;
                this.mixIds = _.pluck(mixes, '_id');
                this.isLoading = false;
                this.isEmpty = !this.mixIds.length;
                if (!this.isEmpty){
                    this.loadNextPage();
                    if (!mediaPlayer.isPlaying && !mediaPlayer.isPaused){
                        mediaPlayer.setPlaylist(Playlist.fromMixStream(this));
                        mediaPlayer.goto(0, true);
                    }
                }
            }).catch(error);
            
            if (streamName === 'search-mixes'){
                api('search.users', {keywords: streamParams.keyword}).then((users) => {
                    this.users = users;
                });
            }
        }
        
        /**
         * Load next page
         */
        loadNextPage(){
            if (this.mixIds.length > this.loadedMixIds.length) {
                var nextMixIds = this.mixIds.slice(this.loadedMixIds.length, this.loadedMixIds.length + 10);
                this.page.subscribe('Mix', function(){
                    return [nextMixIds];
                });
                this.loadedMixIds = this.loadedMixIds.concat(nextMixIds); 
            }
        }
        
        // TODO:
        // Infinite loading
        // Mix component: subscribe mix
    }
    
    return MixStream;
});