/**
 * Video track
 */
class VideoTrack {

    constructor(video){
        this.video = video;
        this.url = (this.video.process ? this.video.process.url : this.video.url).replace('http:', 'https:');
        this._id = this.video._id;
    }
}

// export
window.VideoTrack = VideoTrack;
