/**
 * Playlist class
 */
class Playlist {
    
    /**
     * Create a playlist from a mix stream
     */
    static fromMixStream(mixStream){
        var mediaElements = mixStream.mixes.map(function(mix){
            return MediaElement.fromMix(mix);
        });
        return new Playlist(mediaElements, mixStream.id);
    }
    
    /**
     * Create a playlist from an audio track
     */
    static fromAudioTrack(audioTrack){
        return new Playlist([ MediaElement.fromAudioTrack(audioTrack) ], audioTrack._id);
    }
    
    //--------------------------------------------------------------------------
    
    /**
     * Create a playlist
     */
    constructor(mediaElements, id){
        this.items = mediaElements;
        this.id = id;
    }
    
}

// export
window.Playlist = Playlist;