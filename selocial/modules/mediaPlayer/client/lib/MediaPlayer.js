/**
 * Media player class
 */
class MediaPlayer {

    constructor($scope){
        this.$scope = $scope;
        this.alreadyPlayed = {};
        this.reset();
    }

    /**
     * Set a widget
     */
    setWidget(widget){
        this.widget = widget;
        this.updateWidget();
    }

    updateVideo(){
        if (!this.currentMediaElement.audioTracks || !this.currentMediaElement.audioTracks.length) {
            this.$videoPlayer.unbind('timeupdate');
            var $waveformOverlay = $('.waveform-overlay');
            this.$videoPlayer.bind('timeupdate', (e)=>{
                var seconds = this.videoPlayer.currentTime;
                if (!this.widget.trackControl.data('locked')){
                    this.widget.trackControl.slider('value', Math.round(seconds * 1000));
                }
                var widthPercent = 100 * seconds / this.currentMediaElement.totalDuration;

                $waveformOverlay.css('width', widthPercent+'%');
                this.updateTimeLeft(seconds);
            });
        }
    }

    updateTimeLeft(seconds){
        var currentTimeValue = Math.max(0, Math.floor(this.currentMediaElement.totalDuration - seconds));
        if (currentTimeValue !== this.lastTimeValue){
            this.lastTimeValue = currentTimeValue;
            var timeAsString = '', x;
            x = Math.floor(currentTimeValue / 3600);
            if (x > 0){
                timeAsString += x + ':';
                currentTimeValue -= x * 3600;
            }
            x = Math.floor(currentTimeValue / 60);
            timeAsString += (x > 0 ? ('0' + x).substr(-2) : x) + ':';
            x = currentTimeValue - x * 60;
            timeAsString += (x > 0 ? ('0' + x).substr(-2) : x);

            this.widget.nowPlayingTime.html(timeAsString);
        }
    }

    /**
     * Update widget
     */
    updateWidget(){
        if (this.widget && this.currentMediaElement) {
            this.widget.trackControl.slider('option', 'max', this.currentMediaElement.totalDuration * 1000);
            this.$audioPlayer.unbind('timeupdate');
            this.$audioPlayer.unbind('error');
            this.$audioPlayer.unbind('ended');
            this.$videoPlayer.unbind('timeupdate');
            var $waveformOverlay = $('.waveform-overlay');
            this.lastTimeValue = 0;

            if (!this.currentMediaElement.audioTracks || !this.currentMediaElement.audioTracks.length) {
                this.updateVideo()
            } else {
                this.$audioPlayer.bind('timeupdate', (e)=>{
                    var seconds = this.currentMediaElement.waveforms[this.currentTrackIndex].start + this.audioPlayer.currentTime;
                    // Set seekbar
                    if (!this.widget.trackControl.data('locked')){
                        this.widget.trackControl.slider('value', Math.round(seconds * 1000));
                    }
                    // Set media player waveform overlay
                    var widthPercent = 100 * seconds / this.currentMediaElement.totalDuration;

                    $waveformOverlay.css('width', widthPercent+'%');
                    this.updateTimeLeft(seconds);
                });

                this.$audioPlayer.bind('error', (e)=>{
                    safeApply(this.$scope, ()=>{
                        this.isError = true;
                        this.$scope.api("mix.notifyMissingTrack", {mixId: this.currentMediaElementId, trackIndex: this.currentTrackIndex});
                    });
                    setTimeout(()=>{
                        this.nextTrack();
                    }, 5000);
                });

                this.$audioPlayer.bind('ended', (e)=>{
                    this.nextTrack();
                });
            }
        }
    }

    /**
     * Reset
     */
    reset(){
        safeApply(this.$scope, ()=>{
            this.setPlaylist(null);
            this.news = [];

            if (this.$audioPlayer){
                this.$audioPlayer.remove();
            }
            if (this.$videoPlayer){
                this.$videoPlayer.remove();
            }

            var $audioPlayer = $('<audio class="hidden"></audio>');
            var $videoPlayer = $('<video class="hidden"></video>');

            $('body').append($audioPlayer).append($videoPlayer);

            this.$audioPlayer = $audioPlayer;
            this.$videoPlayer = $videoPlayer;
            this.audioPlayer = $audioPlayer.get(0);
            this.videoPlayer = $videoPlayer.get(0);

            this.isLoaded = false;

            this.videoPlayer.addEventListener('ended', ()=>{
                if (!this.currentMediaElement.audioTracks || !this.currentMediaElement.audioTracks.length){
                    this.next();
                } else {
                    this.videoPlayer.pause();
                    this.videoPlayer.currentTime = '0';
                    this.videoPlayer.play();
                }
            });
        });
    }

    /**
     * Set the playlist
     */
    setPlaylist(playlist){
        safeApply(this.$scope, ()=>{
            this.playlist = playlist;
            this.currentIndex = 0;
            this.currentTrackIndex = 0;
            this.currentTrackId = null;
            this.currentTrackName = null;
            this.currentMediaElement = null;
            this.currentMediaElementId = null;
            this.isPlaying = false;
            this.isPaused = false;
            this.hasMedia = this.playlist && this.playlist.items.length > 0;
        });
    }

    /**
     * Play
     */
    play(){
        safeApply(this.$scope, ()=>{
            this.isLoaded = true;
            this.isPaused = false;
            if (this.currentMediaElement){
                this.currentMediaElement.play(this);
            }
        });
    }

    /**
     * Pause
     */
    pause(){
        safeApply(this.$scope, ()=>{
            this.isPlaying = false;
            this.isPaused = true;
            this.audioPlayer.pause();
            this.videoPlayer.pause();
        });
    }

    /**
     * Go to the nth media element in the playlist
     */
    goto(index, skipTrack){
        safeApply(this.$scope, ()=>{
            this.currentIndex = index;
            this.currentTrackIndex = 0;
            this.currentTrackId = null;
            this.currentTrackName = null;
            this.currentMediaElement = this.playlist && this.playlist.items && this.playlist.items[index]
                ? this.playlist.items[index]
                : null;
            this.currentMediaElementId = this.currentMediaElement
                ? this.currentMediaElement.id
                : null;
            if (!this.currentMediaElementId){
                this.end();
            } else {
                this.updateWidget();
                if (!skipTrack){
                    this.gotoTrack(0);
                }
                this.$scope.$broadcast('scrollToMix', this.currentMediaElementId);
            }
        });
    }

    /**
     * Go to the nth track in the current media element
     */
    gotoTrack(index){
        safeApply(this.$scope, ()=>{
            this.isError = false;
            if (this.currentMediaElement){
                if (!this.currentMediaElement.gotoTrack(index, this)){
                    this.next();
                } else {

                    if ((!this.currentMediaElement.audioTracks || !this.currentMediaElement.audioTracks.length) && !this.currentMediaElement.videoTrack){
                        safeApply(this.$scope, ()=>{
                            this.isError = true;
                        });
                        setTimeout(()=>{
                            this.nextTrack();
                        }, 5000);
                        return;
                    }

                    this.play();
                    if (index === 0){
                        Meteor.call("mix_getNews", {mixId: this.currentMediaElementId}, (err, resp)=>{
                            safeApply(this.$scope, ()=>{
                                if (!err){
                                    this.news = resp;
                                } else {
                                    this.news = [];
                                }
                            });
                        });
                    }
                }
            }
        });
    }

    /**
     * Seek
     */
    seek(milliseconds){
        this.currentMediaElement.seek(this, milliseconds);
    }

    /**
     * Load next playlist item
     */
    next(){
        safeApply(this.$scope, ()=>{
            var setFullscreenMix = false;
            if (this.$scope.$root.fullscreenMix && this.$scope.$root.fullscreenMix._id === this.currentMediaElementId){
                setFullscreenMix = true;
            }
            this.goto(this.currentIndex + 1);
            this.play();
            if (setFullscreenMix) {
                this.$scope.$root.fullscreenMix = Mix.findOne({_id: this.currentMediaElementId});
            }
        });
    }

    /**
     * Load next track in the current playlist
     */
    nextTrack(){
        this.gotoTrack(this.currentTrackIndex + 1);
    }

    /**
     * Load previous playlist item
     */
    previous(){
        if (this.currentIndex > 0){
            this.goto(this.currentIndex - 1);
        }
    }

    /**
     * Load previous track in the current playlist
     */
    previousTrack(){
        if (this.currentTrackIndex === 0){
            this.previous();
        } else {
            this.gotoTrack(this.currentTrackIndex - 1);
        }
    }

    /**
     * No more tracks
     */
    end(){
        this.reset();
    }

    /*
    addVideoProxy(canvas){
        this.videoProxies.push(canvas);
    }

    removeVideoProxy(canvas){
        this.videoProxies = _.without(this.videoProxies, canvas);
    }
    */
}

// export
window.MediaPlayer = MediaPlayer;
