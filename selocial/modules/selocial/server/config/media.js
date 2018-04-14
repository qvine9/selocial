/**
 * Media configuration
 */
config.media = {
    
    /**
     * Local file upload path
     */
    uploadPath: '/.uploads',
  
    /**
     * Ubuntu uses the avconv fork of ffmpeg
     */
    ffmpegExecutable: 'ffmpeg',
    
    /**
     * GraphicsMagic executable name
     */
    gmExecutable: 'gm',
    
    /**
     * Info to get mp3 metadata and edit ID3 tags
     */
    mp3infoExecutable: 'mp3info',
    
    /**
     * Filter to apply to the video (720p)
     */
    //does anybody know why like this?
    //videoFilter: "scale='if(gt(a,1),1280,-1)':'if(lt(a,1),-1,720)'",
    videoFilter: "scale='-1:720'",
    
    /**
     * Audio bitrate of video files
     */
    videoAudioBitrate: '160k',
    
    /**
     * Time offset at which the screenshot will be taken
     */
    screenshotOffset: '00:00:03.000',
    
    /**
     * The size to which images are resized (480p)
     */
    imageSize: 'x720',
    
    /**
     * Thumbnail image size - the weird looking sizes are for direct calling for the GM utility.
     */
    thumbnailImageSize: 'x350',
    thumbnailImageSizeCrop: '350x350',
    thumbnailImageSizeW: 350,
    thumbnailImageSizeH: 350,
    
    /**
     * Profile Image
     */
    
    profileImageSize: 'x350',
    
    /**
     * Cover photo size
     */
    
    coverPhotoSize: '1280x720',
     
    
    /**
     * Waveform size
     */
    waveformSize: '1280x50',
    
    /**
     * File processor version
     */
    fileProcessorVersion: 16,

    /*
    * Path to default track's cover art
    * */
    defaultCoverArt: Assets.absoluteFilePath('defaultCover.jpg'),

    /**
     * Album art size (it will be squared to the size below
     */
    coverArtSize: 500
};
