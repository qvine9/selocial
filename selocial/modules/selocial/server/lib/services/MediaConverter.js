let child_process = Npm.require('child_process'),
    fs = Npm.require('fs'), 
    ini = Npm.require('ini');

/**
 * Media converter service
 */
class _MediaConverter {  
    
    /**
     * Transcode video
     *
     * Calling this command will spawn a new ffmpeg process, generate the preview image and then convert the video to Standard 480p web video.
     */
    static transcodeVideo(videoFile, outputVideoFile, callback){
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', videoFile,            
            '-c:v', 'libx264',
            '-profile:v', 'baseline',
            '-preset', 'slow',
            '-level', '3.0',
            '-vf', config.media.videoFilter,
            '-threads', '0', 
            '-codec:a', 'aac',
            '-b:a', config.media.videoAudioBitrate,
            '-movflags', '+faststart',
            '-y',
            outputVideoFile
        ], function(err){
            callback(err, outputVideoFile);
        });
    }
    

    /**
     * Transcode audio
     *
     * Convert an audio file to mp3
     *   ffmpeg -i input_file.wav --codec:a libmp3lame -qscale:a 2 -y output.mp3
     * Since we are targeting ubuntu, we use avconv instead of ffmpeg.
     */
    static transcodeAudio(audioFile, outputAudioFile, callback){
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', audioFile,
            '-codec:a', 'mp3',
            '-qscale:a', '2',
            '-codec:v', 'copy',
            '-id3v2_version', '3',
            '-y',
            '-max_muxing_queue_size', '400',
            outputAudioFile
        ], function(err){
            callback(err, outputAudioFile);
        });
    }

    /**
     * Add album art to the audio track
     * ffmpeg -i x.mp3 -i x.jpg -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v
     * title="Album cover" -metadata:s:v comment="Cover (Front)" xx.mp3
     */
    static addAlbumArt(audioFile, outputAudioFile, imageFile, callback) {
        console.log('adding album art. source file: ' + audioFile, '; output file: ' + outputAudioFile +
            'image to embed: ' + imageFile);
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', audioFile,
            '-i', imageFile,
            '-c', 'copy',
            '-map', '0:0',
            '-map', '1',
            '-id3v2_version', '3',
            '-y',
            outputAudioFile
        ], function (err) {
            callback(err, outputAudioFile);
        });
    }

    static addAlbumArtBatch(audioFile, outputAudioFile, imageFiles, callback) {
        var uploadPath = config.media.uploadPath;
        console.log('Batch adding album art. source file: ' + audioFile, '; output file: ' + outputAudioFile +
            ' images to embed: ' + JSON.stringify(imageFiles));
        var options = ['-i', audioFile];
        imageFiles.map(image => {
            options.push('-i', uploadPath + image.path);
        });
        options.push('-c', 'copy', '-map', '0:0');
        imageFiles.forEach((image, index, arr) => {
            var ind = index + 1;
            options.push('-map', ind);
        });
        options.push('-id3v2_version', '3', '-y', outputAudioFile);
        ShellCommand.run(config.media.ffmpegExecutable, options, function (err) {
            callback(err, outputAudioFile);
        });
    }

    /**
    * Extract album art from audio file
    * */
    static extractAlbumArt(audioFile, imageFile, callback) {
        console.log('Checking cover art at file: ' + audioFile);
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', audioFile,
            '-an',
            '-vcodec', 'copy',
            imageFile
        ], function (err) {
            callback(err, audioFile);
        });
    }

    /**
     * Get metadata from a media file
     *
     * ffmpeg -i input.mp3 -f ffmetadata output.txt
     */
    static getMetadata(mediaFile, metadataFile, callback){
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', mediaFile,
            '-f', 'ffmetadata',
            '-y',
            metadataFile
        ], function(err, data){
            var durationMatch = /Duration:\s*([0-9:.]+)/.exec(err),
                duration = durationMatch[1];
            if (duration){
                var durationParts = /^([0-9]+):([0-9]+):([0-9]+)/.exec(duration),
                    durationInSeconds = 3600 * parseInt(durationParts[1]) + 60 * parseInt(durationParts[2]) + parseInt(durationParts[3]);
                var metadata = ini.parse(fs.readFileSync(metadataFile, 'utf-8'));
                metadata.duration = durationInSeconds;
                for (var key in metadata){
                    if (/(^\$|\.)/.test(key)){
                        delete(metadata[key]);
                    }
                }
                callback(null, metadata);
            } else {
                callback("Invalid video file format!");
            }
        }, true);
    }
    
    /**
     * Get mp3 length in seconds
     *
     * mp3info -p "%S" input.mp3
     */
    static getMp3Length(mediaFile, callback){
        ShellCommand.run(config.media.mp3infoExecutable, [
            '-p', '%S', mediaFile
        ], function(err, lengthInSeconds){
            if (err) {
                return callback(err);
            }
            
            callback(null, parseInt(lengthInSeconds));
        });
    }
    
    /**
     * Render waveform
     *
     * Convert an audio file to waveform image
     *    ffmpeg -i input_file.wav -lavfi compand,showwavespic=s=600x200,format=rgba,colorkey=white output-waveform.png
     * Since we are targeting ubuntu, we use avconv instead of ffmpeg.
     */
    static renderWaveform(audioFile, outputImageFile, callback){
        console.log('waveform generator here! input: ' + audioFile + '; output: ' + outputImageFile);
        console.log('output file already exists: ' + fs.existsSync(outputImageFile));
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', audioFile,
            '-filter_complex', 'compand,showwavespic=s='+config.media.waveformSize+',format=rgb24', 
            '-y',
            outputImageFile
        ], function(err){
            if (err || !fs.existsSync(outputImageFile)) {
                console.log('the waveform file does not exist - something went wrong');
                return callback(err);
            }
            console.log('let\'s add transparency!');
            // Add transparency
            ShellCommand.run(config.media.gmExecutable, [
                'convert',
                '-transparent', '#000000',
                '-negate',
                outputImageFile,
                outputImageFile
            ], function(err){
                if (err || !fs.existsSync(outputImageFile)){
                    console.log('the waveform file doesn\'t exist, something went wrong');
                    return callback(err);    
                }
                
                // Negate alpha channel
                ShellCommand.run(config.media.gmExecutable, [
                    'convert',
                    '-operator', 'Opacity', 'Xor', '65535',
                    outputImageFile,
                    outputImageFile
                ], function(err){
                    callback(err, outputImageFile);
                });
            });
        });
    }
    
    /**
     * Capture a video frame
     *
     * ffmpeg -i input.flv -ss 00:00:14.435 -vframes 1 -vf scale=-1:480 -y out.png
     */
    static captureFrame(videoFile, outputImageFile, callback){
        ShellCommand.run(config.media.ffmpegExecutable, [
            '-i', videoFile,
            '-ss', config.media.screenshotOffset, 
            '-vframes', '1',
            '-qscale:v', '2',
            '-vf', config.media.videoFilter,
            '-y',
            outputImageFile
        ], function(err){
            callback(err, outputImageFile);
        });
    }
    
    /**
     * Convert image
     *
     * gm convert -size 848x480 cockatoo.jpg -resize 848x480 +profile "*" thumbnail.jpg
     */
    static convertImage(inputImageFile, outputImageFile, callback){
        if (/\.gif$/.test(inputImageFile)){
            return callback(null, inputImageFile);
        }
        ShellCommand.run(config.media.gmExecutable, [
            'identify',
            inputImageFile,
            '-format', '%[EXIF:Orientation]'
        ], function(err, data){
            var rotate = 0;
            if (data){
                data = data.trim();
                if (data == '6'){
                    rotate = 90;
                } else if (data == '8') {
                    rotate = -90;
                }
            }
            var params = [
                'convert',
                '-size', config.media.imageSize,
                inputImageFile,
                '-resize', config.media.imageSize,
                '+profile', '"*"',
                outputImageFile
            ];
            if (rotate){
                params.splice(4,0,'-rotate',rotate);
            }
            ShellCommand.run(config.media.gmExecutable, params, function(err){
                callback(err, outputImageFile);
            });
        });
    }
    
    /**
     * Create thumbnail
     *
     * gm convert -size 250x250 cockatoo.jpg -resize 250x250 +profile "*" thumbnail.jpg
     */
    static createThumbnail(inputImageFile, outputImageFile, callback){
        if (/\.gif$/.test(inputImageFile)){
            return callback(null, inputImageFile);
        }

        gm(inputImageFile)
            .resize(config.media.thumbnailImageSizeW, config.media.thumbnailImageSizeH, '^>')
            .gravity('Center')
            .crop(config.media.thumbnailImageSizeW, config.media.thumbnailImageSizeH)
            .write(outputImageFile, function (err) {
                callback(err, outputImageFile);
            });
    }

    /**
     * Process user's uploaded image to be withing desired size limits
     */
    static convertAlbumArt(inputImageFile, outputImageFile, callback) {
        gm(inputImageFile)
            .resize(config.media.coverArtSize, config.media.coverArtSize, '^>')
            .gravity('Center')
            .crop(config.media.coverArtSize, config.media.coverArtSize)
            .write(outputImageFile, function (err) {
                callback(err, outputImageFile);
            });
    }
    
    /**
     * Cover photo size
     */
    static convertCoverPhoto(inputImageFile, outputImageFile, callback){
        ShellCommand.run(config.media.gmExecutable, [
            'convert',
            //'-auto-orient',
            // '-size', config.media.coverPhotoSize,
            inputImageFile,
            '-resize', config.media.coverPhotoSize,
            '+profile', '"*"',
            '-gravity', 'Center',
            outputImageFile
        ], function(err){
            callback(err, outputImageFile);
        });
    }
    
    /**
     * Convert image
     *
     * gm convert -size 848x480 cockatoo.jpg -resize 848x480 +profile "*" thumbnail.jpg
     */
    static convertSoundCloudWaveformImage(inputImageFile, outputImageFile, callback){
        ShellCommand.run(config.media.gmExecutable, [
            'convert',
            '-contrast','-contrast','-contrast','-contrast','-contrast',
            //'-negate',
            '-resize', config.media.waveformSize,
            inputImageFile,
            outputImageFile
        ], function(err){
            callback(err, outputImageFile);
        });
    }

    /**
     * Replace the file extension
     * @param filename
     * @param extension
     * @returns {*}
     */
    static replaceExtension(filename, extension){
        return filename.replace(/\.[^.]+$/, '') + extension;
    };
    
    /**
     * Process a file
     */
    static process(fileInfo, process, trackId, isTrack, _callback){
        var uploadPath = config.media.uploadPath;
        
        /**
         * Stub for class method. Left here in order to simplify calls below
         */
        function replaceExtension(filename, extension){
            return MediaConverter.replaceExtension(filename, extension);
        };

        /**
         * Get the file extension
         */
        function getExtension(filename, allowedExtension, defaultExtension){
            var ext = filename.replace(/.*\./, '').toLocaleLowerCase();
            if (_.contains(allowedExtension, ext)) {
                return ext;
            }
            return defaultExtension;
        };
        
        /**
         * Update embedded file info in mix
         */
        var updateUploadedFileInMix = function(id, field){
            var uploadedFile = UploadedFile.findOne({_id: id});
            if (uploadedFile.mixId){
                switch (field){
                    case 'images':
                        var mix = Mix.findOne({_id: uploadedFile.mixId});
                        if (mix.images) {
                            for (var i = 0; i < mix.images.length; i++){
                                if (mix.images[i]._id === id){
                                    var updateData = {$set: {}};
                                    updateData.$set['images.' + i] = uploadedFile;
                                    Mix.update({_id: uploadedFile.mixId}, updateData);
                                    return;
                                }
                            }
                        }
                        break;
                    case 'video':
                        Mix.update({_id: uploadedFile.mixId}, {$set: {video: uploadedFile}});
                        break;
                }
            }
        };

        /**
         * Upload embedded file info in track
         */
        var updateUploadedFileInTrack = function(id){
            var uploadedFile = UploadedFile.findOne({_id: id});
            if (uploadedFile.trackId){
                Track.update({_id: uploadedFile.trackId}, {$set: {file: uploadedFile}});
            }
        };

        /*
        *  Second part of uploaded audio processing
        * */
        var ProcessAudioStep2 = function (convertedAudio) {
            console.log('Second chapter of audio processing');
            MediaConverter.renderWaveform(convertedAudio, replaceExtension(convertedAudio, '.png'), Meteor.bindEnvironment(function(err, pngFile){
                var waveformUrl;
                if (err) {
                    console.log('waveform rendering error');
                    console.log(err);
                    waveformUrl = 'https://selocial.s3.amazonaws.com/selocialweb/images/waveform.png';
                    //return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                }

                if (waveformUrl) {
                    return FileStorage.save(convertedAudio, replaceExtension(fileInfo.name, '.mp3'), Meteor.bindEnvironment(function(err, audioUrl){
                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                            url: audioUrl,
                            'process.type': 'mixAudio',
                            'process.url': audioUrl,
                            'process.waveformUrl': waveformUrl
                        }});
                        updateUploadedFileInTrack(fileInfo._id);
                    }));
                }

                FileStorage.save(convertedAudio, replaceExtension(fileInfo.name, '.mp3'), Meteor.bindEnvironment(function(err, audioUrl){
                    FileStorage.save(pngFile, replaceExtension(fileInfo.name, '.png'), Meteor.bindEnvironment(function(err, waveformUrl){
                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                            url: audioUrl,
                            'process.type': 'mixAudio',
                            'process.url': audioUrl,
                            'process.waveformUrl': waveformUrl
                        }});
                        updateUploadedFileInTrack(fileInfo._id);
                    }));
                }));
            }));
        };

        switch (process){
            case 'coverArtAlbum':
                console.log('Album cover art uploaded! File: ' + uploadPath + fileInfo.path);
                console.log('_id: ' + fileInfo._id);
                var cover = fileInfo.path;
                var original, originalName, originalPath;
                if (!trackId) return; //here we we will get Album ID. If no ID - don't need to do anything.
                MediaConverter.convertAlbumArt(uploadPath + cover, uploadPath + replaceExtension(cover, '-p.jpg'), Meteor.bindEnvironment(function(err, processedCover) {
                    if (err) {
                        console.log('Error scaling album art');
                        console.log(err);
                        UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                        UploadServer.delete(fileInfo.path);
                        return;
                    }
                    MediaConverter.createThumbnail(processedCover, replaceExtension(processedCover, '-t.jpg'), Meteor.bindEnvironment(function(err, thumbnailImage){
                        if (err) {
                            console.log('Error creating thumbnail for album art.');
                            console.log(err);
                            UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                            UploadServer.delete(fileInfo.path);
                            return;
                        }
                        FileStorage.save(thumbnailImage, replaceExtension(fileInfo.name, '-p-t.jpg'), Meteor.bindEnvironment(function(err, fileURL) {
                            if (err) {
                                console.log('Error uploading album art thumbnail to S3');
                                console.log(err);
                                UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                                UploadServer.delete(fileInfo.path);
                                return;
                            }
                            console.log('Album art thumbnail stored in S3');
                            console.log('new url: ' + fileURL);
                            UploadedFile.update({_id: fileInfo._id},
                                {
                                    $set: {
                                        'process.type': 'coverArtAlbum',
                                        'process.thumbnailUrl': fileURL,
                                    }
                                }
                            );
                            // fileInfo.process.type = 'coverArtAlbum';
                            // fileInfo.process.thumbnailUrl = fileURL;
                            FileStorage.save(processedCover, replaceExtension(fileInfo.name, '-p.jpg'), Meteor.bindEnvironment(function(err, fileURL) {
                                if (err) {
                                    console.log('Error uploading album art to S3');
                                    console.log(err);
                                    UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                                    UploadServer.delete(fileInfo.path);
                                    return;
                                }
                                console.log('Album art stored in S3');
                                UploadedFile.update({_id: fileInfo._id},
                                    {
                                        $set: {
                                            'process.type': 'coverArtAlbum',
                                            url: fileURL,
                                            'process.url': fileURL,
                                            name: replaceExtension(fileInfo.name, '-p.jpg'),
                                            path: '/' + replaceExtension(fileInfo.name, '-p.jpg'),
                                        }
                                    }
                                );
                                // fileInfo.process.type = 'coverArtAlbum';
                                // fileInfo.url = fileURL;
                                // file.process.url = fileURL;
                                _callback(null, fileInfo._id);
                            }));
                        }));
                    }));
                }));
                break;
            case 'coverArt':
                console.log('Cover art uploaded! File: ' + uploadPath + fileInfo.path);
                var cover = uploadPath + fileInfo.path;
                var original, originalName, originalPath;
                if (isTrack == 'true') {
                    //we are changing cover for the saved Track
                    original = Track.findOne({_id: trackId});
                    if (original) {
                        originalName = original.file.name;
                        originalPath = original.file.path;
                    }
                    else {
                        console.log('No track found!');
                        return;
                    }
                } else {
                    //we are changing cover for the uploaded file
                    original = UploadedFile.findOne({_id: trackId});
                    if (original) {
                        originalName = original.name;
                        originalPath = original.path;
                    }
                    else {
                        console.log('No uploaded file found!');
                        return;
                    }
                }
                var path = uploadPath + replaceExtension(originalPath, '-transcoded-covered.mp3');
                if (!fs.existsSync(path))
                    path = uploadPath + replaceExtension(originalPath, '-transcoded.mp3');
                if (!fs.existsSync(path) && original.process)
                    path = original.process.url;
                if (!original.process && original.file)
                    path = original.file.process.url;
                MediaConverter.convertAlbumArt(cover, replaceExtension(cover, '-processed.jpg'), Meteor.bindEnvironment(function(err, processedCover) {
                    if (err) {
                        console.log('Error scaling album art');
                        console.log(err);
                        return;
                    }
                    MediaConverter.addAlbumArt(path, replaceExtension(originalName, '-edited.mp3'), processedCover, Meteor.bindEnvironment(function(err, processedTrack) {
                        if (err) {
                            console.log('Error adding album art to the file');
                            console.log(err);
                            return;
                        }
                        MediaConverter.createThumbnail(processedCover, replaceExtension(originalName, '-cover.png'), Meteor.bindEnvironment(function(err, thumbnail){
                            if (err) {
                                console.log('Error creating thumbnail');
                                console.log(err);
                                return;
                            }
                            FileStorage.save(processedTrack, originalName, Meteor.bindEnvironment(function(err, fileURL) {
                                if (err) {
                                    console.log('Error uploading track with new cover art');
                                    console.log(err);
                                    return;
                                }
                                console.log('Updated track stored in S3');
                                if (isTrack == 'true') {
                                    Track.update({_id: trackId},
                                        {
                                            $set: {
                                                'file.url': fileURL,
                                                'file.process.url': fileURL
                                            }
                                        });
                                }
                                else {
                                    UploadedFile.update({_id: trackId},
                                        {
                                            $set: {
                                                url: fileURL,
                                                'process.url': fileURL
                                            }
                                        }
                                    );
                                }
                            }));
                            FileStorage.save(thumbnail, replaceExtension(originalName, '.coverart.png'), Meteor.bindEnvironment(function(err, thumbnailUrl){
                                if (err) {
                                    console.log('Error uploading track thumbnail');
                                    console.log(err);
                                    return;
                                }
                                console.log('Updated thumbnail stored in S3');
                                var t = new Date().getTime();
                                if (isTrack == 'true') {
                                    Track.update({_id: trackId},
                                        {
                                            $set: {
                                                'file.process.thumbnailUrl': thumbnailUrl + '?v=' + t
                                            }
                                        });
                                }
                                else {
                                    UploadedFile.update({_id: trackId},
                                        {
                                            $set: {
                                                'process.thumbnailUrl': thumbnailUrl + '?v=' + t
                                            }
                                        }
                                    );
                                }
                            }));
                        }));
                    }));
                }));
                break;

            case 'profileImage':
            case 'mixImage':
                MediaConverter.convertImage(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '-resized.' + getExtension(fileInfo.path, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, convertedImage){
                    if (err) {
                        console.log(err);
                        UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                        UploadServer.delete(fileInfo.path);
                        return;
                    }

                    MediaConverter.createThumbnail(convertedImage, replaceExtension(convertedImage, '-thumbnail.' + getExtension(convertedImage, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, thumbnailImage){
                        FileStorage.save(convertedImage, replaceExtension(fileInfo.name, '.' + getExtension(convertedImage, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, url){
                            FileStorage.save(thumbnailImage, replaceExtension(fileInfo.name, '-thumbnail.' + getExtension(thumbnailImage, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, thumbnailUrl){
                                UploadedFile.update({_id: fileInfo._id}, {$set: {
                                    url: url,
                                    process: {
                                        type: 'mixImage',
                                        url: url,
                                        thumbnailUrl: thumbnailUrl
                                    }
                                }});
                                if (process === 'mixImage'){
                                    updateUploadedFileInMix(fileInfo._id, 'images');
                                }
                            }));
                        }));
                    }));
                }));
                break;

            case 'coverPhoto':
                MediaConverter.convertCoverPhoto(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '-resized.' + getExtension(fileInfo.path, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, convertedImage){
                    if (err) {
                        console.log(err);
                        UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                        UploadServer.delete(fileInfo.path);
                        return;
                    }

                    FileStorage.save(convertedImage, replaceExtension(fileInfo.name, '.' + getExtension(convertedImage, ['gif', 'jpg'], 'jpg')), Meteor.bindEnvironment(function(err, url){
                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                            url: url,
                            process: {
                                type: 'coverPhoto',
                                url: url
                            }
                        }});
                    }));
                }));
                break;

            case 'mixAudio':
                console.log('check metadata of file. uploadPath: ' + uploadPath + '; path: ' + fileInfo.path);
                MediaConverter.getMetadata(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '.txt'), Meteor.bindEnvironment(function(err, metadata){
                    if (err) {
                        console.log('get metadata error!');
                        console.log(err);
                        UploadServer.delete(fileInfo.path);
                        return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                    }

                    UploadedFile.update({_id: fileInfo._id}, {$set: {
                        metadata: metadata
                    }});

                    MediaConverter.transcodeAudio(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '-transcoded.mp3'), Meteor.bindEnvironment(function(err, convertedAudio){
                        UploadServer.delete(fileInfo.path);

                        if (err) {
                            console.log('audio transcoding error');
                            console.log(err);
                            return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                        }

                        MediaConverter.getMp3Length(convertedAudio, Meteor.bindEnvironment(function(err, lengthInSeconds){
                            if (!err) {
                                UploadedFile.update({_id: fileInfo._id}, {$set: {
                                    "metadata.duration": lengthInSeconds
                                }});
                            } else {
                                console.log(err);
                            }
                            console.log('About to check if track has cover art');
                            MediaConverter.extractAlbumArt(convertedAudio, replaceExtension(convertedAudio, '-coverArt.jpg'), Meteor.bindEnvironment(function (err, checkedAudio) {
                                artPath = replaceExtension(checkedAudio, '-coverArt.jpg');
                                if(err) {
                                    if (err.indexOf('does not contain any stream') < 0) {
                                        console.log('extracting album art error');
                                        console.log(err);
                                        return UploadedFile.update({_id: fileInfo._id}, {$set: {processError: true}});
                                    }
                                }
                                if (fs.existsSync(artPath)) {
                                    //the track has album art
                                    MediaConverter.createThumbnail(artPath, replaceExtension(artPath, '-thumbnail.png'), Meteor.bindEnvironment(function (err, pngFile) {
                                        FileStorage.save(pngFile, replaceExtension(fileInfo.name, '.coverart.png'), Meteor.bindEnvironment(function(err, thumbnailUrl) {
                                            UploadedFile.update({_id: fileInfo._id}, {
                                                $set: {
                                                    'process.thumbnailUrl': thumbnailUrl
                                                }
                                            });
                                            console.log('coverArt found, and uploaded to S3, skip adding custom coverArt and proceed');
                                            ProcessAudioStep2(checkedAudio);
                                        }));
                                    }));

                                } else {
                                    //the track has no album art, add our logo
                                    console.log('coverart not found! add our pic and proceed');
                                    MediaConverter.addAlbumArt(checkedAudio, replaceExtension(checkedAudio, '-covered.mp3'), config.media.defaultCoverArt, Meteor.bindEnvironment(function (err, coveredAudio) {
                                        if (err) {
                                            console.log('adding album art error');
                                            console.log(err);
                                            return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                                        }
                                        console.log('album art added to file: ' + coveredAudio);
                                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                                            process: {
                                                thumbnailUrl: '\\defaultCover.jpg'
                                            }
                                        }});
                                        ProcessAudioStep2(coveredAudio);
                                    }))
                                }
                            }));
                        }));
                    }));
                }));
                break;

            case 'mixVideo':
                console.log('check metadata of file. uploadPath: ' + uploadPath + '; path: ' + fileInfo.path);
                MediaConverter.getMetadata(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '.txt'), Meteor.bindEnvironment(function(err, metadata){
                    if (err) {
                        console.log('get metadata error!');
                        console.log(err);
                        UploadServer.delete(fileInfo.path);
                        return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                    }

                    UploadedFile.update({_id: fileInfo._id}, {$set: {
                        metadata: metadata
                    }});

                    MediaConverter.transcodeVideo(uploadPath + fileInfo.path, uploadPath + replaceExtension(fileInfo.path, '-720p.mp4'), Meteor.bindEnvironment(function(err, convertedVideo){
                        if (err) {
                            console.log('transcoding error');
                            console.log(err);
                            return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                        }
                        console.log('let\'s capture frame of the file: ' + convertedVideo + '; we will save the frame to this file: ' + replaceExtension(convertedVideo, '.png'));
                        MediaConverter.captureFrame(convertedVideo, replaceExtension(convertedVideo, '.png'), Meteor.bindEnvironment(function(err, frameFile) {
                            if (err) {
                                console.log('frame capturing error');
                                console.log(err);
                                return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                            }
                            console.log('let\'s process captured frame (resize, crop): ' + frameFile + '; to the file: ' + replaceExtension(frameFile, '_thumbnail.png'));
                            MediaConverter.createThumbnail(frameFile, replaceExtension(frameFile, '_thumbnail.png'), Meteor.bindEnvironment(function (err, pngFile) {
                                if (err) {
                                    console.log('frame processing error');
                                    console.log(err);
                                    return UploadedFile.update({ _id: fileInfo._id }, { $set: { processError: true } });
                                }
                                console.log('let\'s render waveform for the file: ' + convertedVideo + '; and save it to the file: ' + replaceExtension(convertedVideo, '.waveform.png'));
                                MediaConverter.renderWaveform(convertedVideo, replaceExtension(convertedVideo, '.waveform.png'), Meteor.bindEnvironment(function(err, pngFile){
                                    var waveformUrl;
                                    if (err || !pngFile) {
                                        console.log('waveform rendering error');
                                        console.log(err);
                                        waveformUrl = 'https://selocial.s3.amazonaws.com/selocialweb/images/waveform.png';
                                    }

                                    if (waveformUrl) {
                                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                                            "process.waveformUrl": waveformUrl
                                        }});
                                        updateUploadedFileInMix(fileInfo._id, 'video');
                                    } else {
                                        FileStorage.save(pngFile, replaceExtension(fileInfo.name, '.waveform.png'), Meteor.bindEnvironment(function(err, waveformUrl){
                                            UploadedFile.update({_id: fileInfo._id}, {$set: {
                                                "process.waveformUrl": waveformUrl
                                            }});
                                            updateUploadedFileInMix(fileInfo._id, 'video');
                                        }));
                                    }
                                }));

                                FileStorage.save(convertedVideo, replaceExtension(fileInfo.name, '.mp4'), Meteor.bindEnvironment(function(err, videoUrl){
                                    FileStorage.save(pngFile, replaceExtension(fileInfo.name, '.png'), Meteor.bindEnvironment(function(err, posterUrl){
                                        UploadedFile.update({_id: fileInfo._id}, {$set: {
                                            url: videoUrl,
                                            "process.type": 'mixVideo',
                                            "process.url": videoUrl,
                                            "process.posterUrl": posterUrl
                                        }});
                                        updateUploadedFileInMix(fileInfo._id, 'video');
                                    }));
                                }));
                            }));

                        }));
                    }));
                }));
                break;

            default:
                UploadedFile.remove({ _id: fileInfo._id });
                UploadServer.delete(fileInfo.path);
                throw new Meteor.Error("You are not allowed to run this processing.");
        }
    }
}

MediaConverter = _MediaConverter;
