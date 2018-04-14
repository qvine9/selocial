/**
 * Media element base class
 */
class MediaElement {

    /**
     * Create a media element from an audio track
     */
    static fromAudioTrack(audioTrack){
        var duration = audioTrack.source === 'soundcloud'
                ? audioTrack.file.process.duration
                : audioTrack.file.metadata.duration;
        return new MediaElement({
            id: audioTrack._id,
            sourceType: 'audioTrack',
            audioTracks: [ new AudioTrack(audioTrack) ],
            title: audioTrack.title,
            description: audioTrack.source === 'soundcloud'
                ? audioTrack.file.process.genre + ' track by ' + audioTrack.author.username
                : (audioTrack.genres || []).join(', ') + ' track by ' + audioTrack.file.artist,
            waveforms: [{
                id: audioTrack._id,
                image: audioTrack.file.process.waveformUrl,
                duration: duration,
                start: 0,
                width: 100
            }],
            totalDuration: duration
        });
    }

    /**
     * Create a media element from a mix
     */
    static fromMix(mix){
        var audioTracks,
            videoTrack,
            waveforms,
            totalMixDuration = 0;

        if (mix.tracks && mix.tracks.length){
            audioTracks = mix.tracks.map(function(track){
                return new AudioTrack(track);
            });
        }

        if (mix.video){
            videoTrack = new VideoTrack(mix.video);
        }

        if (audioTracks){
            waveforms = [];
            var start = 0;
            _.each(mix.tracks, function(track){
                var isSoundcloud = track.source === 'soundcloud',
                    duration = isSoundcloud
                        ? track.file.process.duration
                        : track.file.metadata.duration;
                totalMixDuration += duration;
                var waveform = {
                    id: track._id,
                    image: track.file.process.waveformUrl,
                    duration: duration,
                    start: start
                };
                waveforms.push(waveform);
                start += duration;
            });
            _.each(waveforms, function(waveform){
                waveform.width = 100 * waveform.duration / totalMixDuration;
            });
        } else if (videoTrack) {
            totalMixDuration = videoTrack.video.metadata ? videoTrack.video.metadata.duration : 60;
            waveforms = [{
                id: videoTrack._id,
                image: videoTrack.video.process ? videoTrack.video.process.waveformUrl : '',
                duration: totalMixDuration,
                start: 0,
                width: 100
            }];
        }

        return new MediaElement({
            id: mix._id,
            sourceType: 'mix',
            audioTracks: audioTracks,
            videoTrack: videoTrack,
            title: mix.title,
            description: mix.description,
            waveforms: waveforms,
            totalDuration: totalMixDuration
        });
    }

    //--------------------------------------------------------------------------

    /**
     * Create media element
     */
    constructor(options){
        _.each(options, (value,key)=>{
            this[key] = value;
        })
    }

    /**
     * Go to the nth track
     */
    gotoTrack(index, mediaPlayer) {
        mediaPlayer.currentTrackIndex = index;
        mediaPlayer.currentTrackId = this.audioTracks && this.audioTracks[index]
            ? this.audioTracks[index]._id
            : null;
        if (index > 0 && !mediaPlayer.currentTrackId) return false;
        return true;
    }

    /**
     * Play the media element
     */
    play(mediaPlayer){
        //mediaPlayer.videoPlayer.pause();
        //mediaPlayer.audioPlayer.pause();
        mediaPlayer.isPlaying = false;

        if (this.videoTrack){
            if (mediaPlayer.videoPlayer.src !== this.videoTrack.url){
                mediaPlayer.videoPlayer.src = this.videoTrack.url;
                if (mediaPlayer.videoPlayer.duration){
                    mediaPlayer.videoPlayer.currentTime = 0;
                }
            }
            if (this.audioTracks && this.audioTracks[mediaPlayer.currentTrackIndex]){
                mediaPlayer.videoPlayer.muted = true;
            } else {
                mediaPlayer.videoPlayer.muted = false;
            }
            //mediaPlayer.videoPlayer.play();
            mediaPlayer.currentTrackName = this.title;
            mediaPlayer.isPlaying = true;


            if (this.sourceType === 'mix'){

                if (!this.lastPlayedTrackId || this.lastPlayedTrackId !== this.videoTrack._id){
                    this.lastPlayedTrackId = this.videoTrack._id;
                    PlayLog.insert({
                        mixId: this.id,
                        type: this.videoTrack.video.process.type || 'selocial',
                        trackId: this.videoTrack._id,
                        userId: Meteor.userId(),
                        createdAt: new Date()
                    });

                    if (typeof(mediaPlayer.currentMediaElementId) === 'string'){
                        Meteor.call("mix_play", {mixId: mediaPlayer.currentMediaElementId});
                    }
                }
            }
            
        } else {
            mediaPlayer.videoPlayer.src = '';
        }

        if (this.audioTracks && this.audioTracks[mediaPlayer.currentTrackIndex]){
            if (mediaPlayer.audioPlayer.src !== this.audioTracks[mediaPlayer.currentTrackIndex].url){
                mediaPlayer.audioPlayer.src = this.audioTracks[mediaPlayer.currentTrackIndex].url;
                if (mediaPlayer.audioPlayer.duration){
                    mediaPlayer.audioPlayer.currentTime = 0;
                }
            }
            mediaPlayer.audioPlayer.play();
            mediaPlayer.currentTrackName = this.audioTracks[mediaPlayer.currentTrackIndex].title;
            mediaPlayer.isPlaying = true;

            if (this.sourceType === 'mix'){
                if (!this.lastPlayedTrackId || this.lastPlayedTrackId !== this.audioTracks[mediaPlayer.currentTrackIndex]._id){
                    this.lastPlayedTrackId = this.audioTracks[mediaPlayer.currentTrackIndex]._id;
                    PlayLog.insert({
                        mixId: this.id,
                        type: this.audioTracks[mediaPlayer.currentTrackIndex].track.source || 'selocial',
                        trackId: this.audioTracks[mediaPlayer.currentTrackIndex]._id,
                        userId: Meteor.userId(),
                        createdAt: new Date()
                    });

                    if (typeof(mediaPlayer.currentMediaElementId) === 'string'){
                        Meteor.call("mix_play", {mixId: mediaPlayer.currentMediaElementId});
                    }
                }
            }

        } else {
            mediaPlayer.audioPlayer.src = '';
        }
    }

    /**
     * Seek
     */
    seek(mediaPlayer, milliseconds){
        var seconds = milliseconds / 1000;

        if (this.videoTrack && (!this.audioTracks || !this.audioTracks.length)){
            // Seek video only
            mediaPlayer.videoPlayer.currentTime = seconds;
        } else {
            // Seek audio or change audio track
            var start = 0
            for (var i = 0; i < this.audioTracks.length; i++){
                var audioTrack = this.audioTracks[i],
                    duration = audioTrack.track.source === 'soundcloud'
                        ? audioTrack.track.file.process.duration
                        : audioTrack.track.file.metadata.duration;
                if (seconds < start + duration) {
                    // Found the track, switch if necessary, then seek
                    if (mediaPlayer.currentTrackIndex !== i){
                        mediaPlayer.gotoTrack(i);
                    }
                    mediaPlayer.audioPlayer.currentTime = seconds - start;
                    break;
                }
                start += duration;
            }

        }
    }
}

// export
window.MediaElement = MediaElement;
