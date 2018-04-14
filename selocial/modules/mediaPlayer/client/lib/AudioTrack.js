/**
 * Audio track
 */
class AudioTrack {

    constructor(track){
        this.track = track;
        this._id = this.track._id;
        this.url = (this.track.file.process.url || '').replace('http:', 'https:');
        this.title = (this.track.artist ? this.track.artist + ' - ' : '') + this.track.title;

        if (this.track.source === 'soundcloud'){
            this.url += '?client_id=' + config.social.soundcloud.clientId;
            this.title += ' [SoundCloud]';
        }
    }

}

// export
window.AudioTrack = AudioTrack;
