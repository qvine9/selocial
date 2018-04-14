let AWS = Npm.require('aws-sdk'),
    fs = Npm.require('fs'),
    md5 = require('md5'),
    mime = require('mime');

/**
 * File storage service
 */
class _FileStorage {
    
    /**
     * Get the S3 instance
     */
    static getS3(){
        if (!this.s3) {
            this.s3 = new AWS.S3({
                s3BucketEndpoint: true,
                endpoint: config.aws.s3Endpoint,
                params: {
                    Bucket: config.aws.s3BucketName 
                }
            });
        }
        return this.s3;
    }

    /**
     * Upload a local file
     */
    static save(localPath, remotePath, callback){
        var key = config.aws.fileStoragePrefix + remotePath,
            saveUrl = config.aws.s3Endpoint + "/" + key;
        this.getS3().upload({
            Key: key, 
            Body: fs.createReadStream(localPath)
        }).send(Meteor.bindEnvironment(function(err, res){
            callback(err, saveUrl);
        }));
        return saveUrl; 
    }
    
    /**
     * Download - TODO add error handling
     */
    static download(url, file){
        var binaryData = HTTP.get(url, {
            headers: {
                "Referer": url
            },
            npmRequestOptions: {
                encoding: null
            }
        }).content;
        fs.writeFileSync(file, binaryData);
    }

    /**
     * Download file async
     * @param url
     * @param file
     * @param cb
     */
    static downloadAsync(url, file, cb) {
        var request = HTTP.get(url, {
                headers: {
                    "Referer": url
                },
                npmRequestOptions: {
                    encoding: null
                },
            },
            (err, result) => {
                if (err) {
                    console.log('Error downloading file from url ' + url);
                    console.log(err);
                    cb(err, null);
                }
                fs.writeFile(file, result.content, (err) => {
                    cb(err, file);
                });
            });
    }
    
    /**
     * Upload a remote URL
     */
    static remoteUpload(url, process){
        console.log("Remote downloading", url, process);
        
        if (!/^https?:/.test(url)){
            throw new Meteor.Error("Wrong url!");
        }

        var originalName = url.replace(/.*\//, '').replace(/\?.*/, '') || process,
            extension = /\./.test(originalName) ? originalName.replace(/.*\./, '') : 'jpg',
            hash = md5(url),
            fileName = hash + '.' + extension,
            filePath = '/' + fileName,
            realFilePath = config.media.uploadPath + filePath;

        var existingFile = UploadedFile.findOne({_id: hash});
        if (existingFile) {
            return existingFile;
        }
        FileStorage.download(url, realFilePath);
        var stats = fs.statSync(realFilePath);
        var file = {
            _id: hash,
            name: fileName,
            originalName: originalName,
            path: filePath,
            size: stats.size,
            type: mime.lookup(realFilePath),
            baseUrl: Meteor.absoluteUrl() + 'upload/',
            url: Meteor.absoluteUrl() + 'upload/' + fileName
        };

        UploadedFile.insert(file);

        MediaConverter.process(file, process);

        return file;
    }
    
}


// Export
FileStorage = _FileStorage;