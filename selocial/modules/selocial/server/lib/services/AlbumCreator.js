let path = Npm.require('path');

/**
 * Album creating service handler
 */
class _AlbumCreator {

    /**
     * Entrypoint for Create Album process
     * @param album
     * @constructor
     */
    static CreateAlbum(album) {
        check(album, config.schema.Album);
        var albumId = Album.insert(album);
        album._id = albumId;
        AlbumCreator.DownloadImages(album);
        return albumId;
    }

    static EditAlbum(album) {
        Album.update({_id: album._id}, {$set:{
            title: album.title,
            artist: album.artist,
            releaseType: album.releaseType,
            catalogId: album.catalogId,
            recordLabel: album.recordLabel,
            releaseDate: album.releaseDate,
            genres: album.genres,
            emotions: album.emotions,
            date: album.date,
            purchasable: album.purchasable,
            images: album.images,
            tracks: album.tracks,
            file: album.file,
            duration: album.duration,
            price: album.price
        }});
        AlbumCreator.DownloadImages(album);
    }

    static DownloadImages(album) {
        var imagesDownloaded = 0;
        var uploadPath = config.media.uploadPath;
        album.images.forEach(image => {
            var url = image.url;
            var file = uploadPath + image.path;
            FileStorage.downloadAsync(url, file, Meteor.bindEnvironment((err, fileName) => {
                if (err) {
                    console.log('Error downloading image file from AWS!');
                    console.log(err);
                    return;
                }
                console.log('Image was downloaded to file: ' + fileName);
                imagesDownloaded++;
                if (imagesDownloaded != album.images.length) return;
                console.log('All the images has been downloaded. Processing...');
                AlbumCreator.ProcessImages(album);
            }));
        });
    }

    static ProcessImages(album) {
        var images = album.images.slice();
        album.images = [];
        var processedImages = 0;
        var albumId = album._id;

        images.map(image => MediaConverter.process(image, 'coverArtAlbum', albumId, false, Meteor.bindEnvironment((err, id) => {
            if (err) {
                console.log('Error processing album images!');
                console.log(err);
                return;
            }
            processedImages++;
            var _image = UploadedFile.findOne({_id: id});
            if (!_image) {
                console.log('Error fetching album image data from DB!');
                return;
            }
            console.log(_image);
            album.images.push(_image);
            if (processedImages == images.length) {
                Album.update({_id: albumId}, {$set: {images: album.images}});
                AlbumCreator.DownloadTracks(album);
            }
        })));
    }

    static DownloadTracks(album) {
        var tracksDownloaded = 0;
        var uploadPath = config.media.uploadPath;
        album.tracks.forEach(track => {
            // console.log(track);
            var url = track.file.url || track.file.process.url;
            var file = uploadPath + track.file.path;
            FileStorage.downloadAsync(url, file, Meteor.bindEnvironment((err, fileName) => {
                if (err) {
                    console.log('Error downloading track file from AWS!');
                    console.log(err);
                    return;
                }
                console.log('track was downloaded to file: ' + fileName);
                tracksDownloaded++;
                if (tracksDownloaded != album.tracks.length) return;
                console.log('All the tracks has been downloaded. Processing...');
                AlbumCreator.ProcessTracks(album);
            }));
        });
    }

    /**
     * Process downloaded tracks
     * @param album
     */
    static ProcessTracks(album) {
        var uploadPath = config.media.uploadPath;
        var tracks = album.tracks.slice();
        // console.log('tracks qty: ' + tracks.length);
        album.tracks = [];
        Album.update({_id: album._id}, {$set: {tracks: []}});
        Track.remove({albumId: album._id});
        tracks.forEach(track => {
            MediaConverter.addAlbumArtBatch(uploadPath + track.file.path,
                MediaConverter.replaceExtension(uploadPath + track.file.path, '-' + album._id + '.mp3'),
                album.images,
                Meteor.bindEnvironment((err, processedTrack) => {
                    if (err) {
                        console.log('Error adding images to track!');
                        console.log(err);
                        return;
                    }
                    track.file.name = path.basename(processedTrack);
                    FileStorage.save(processedTrack,
                        track.file.name,
                        Meteor.bindEnvironment((err, fileURL) => {
                        if (err) {
                            console.log('Error uploading updated track to S3!');
                            console.log(err);
                            return;
                        }
                        console.log('track file saved to S3: ' + fileURL);
                        delete track._id;
                        track.file.path = '/' + track.file.name;
                        track.file.process.thumbnailUrl = album.images[0].process.thumbnailUrl || config.media.defaultCoverArt;
                        track.file.url = track.file.process.url = fileURL;
                        track.albumId = album._id;
                        track.albumTitle = album.title;
                        track.date = new Date();
                        console.log('current track: ' + JSON.stringify(track));
                        var id = Track.insert(track);
                        track._id = id || null;
                        Album.update({_id: album._id}, {$push: {tracks: track}});
                        }));
                    }));
        });
    }
}

AlbumCreator = _AlbumCreator;
