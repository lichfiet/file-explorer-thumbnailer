const s3 = require("../utils/s3.js");
const path = require("path");
const ffmpegCreateThumbnail = require("../utils/ffmpeg.js");
const fs = require("fs");
const { redisPutS3Url } = require("../utils/redis.js");

const generateThumbnail = async (bucketName, key) => {

    const filePathOnDisk = path.join(process.env.THUMBNAIL_FILES_LOCATION, key);
    const thumbnailPathOnDisk = path.join(process.env.THUMBNAIL_FILES_LOCATION, 'thumbnail-' + key + '.png');
    
    const downloadFile = async () => { 
        return await s3.getFile(bucketName, key) 
    };
    const createThumbnail = async () => { 
        return await ffmpegCreateThumbnail(filePathOnDisk, thumbnailPathOnDisk); 
    };
    const uploadFile = async () => { 
        return await s3.uploadFile(bucketName, 'thumbnail-' + key + '.png', thumbnailPathOnDisk) 
    };
    const deleteFiles = async () => { 
        console.debug(`Deleting files for key: ${key}`);
        return new Promise((resolve, reject) => {
            fs.unlink(filePathOnDisk, (err) => {reject(err)});
            fs.unlink(thumbnailPathOnDisk, (err) => {reject(err)});
            resolve();
        });
    };

    
    const generatePresignedUrl = async () =>  await s3.generatePresignedUrl(bucketName, 'thumbnail-' + key + '.png');
    const cachePresignedUrl = async () => await redisPutS3Url(key, await generatePresignedUrl(), process.env.REDIS_TTL);


    try {
        console.log(`Generating Thumbnail for key: ${key}`);
        await downloadFile();
        await createThumbnail();
        await uploadFile();
        await deleteFiles();
        await cachePresignedUrl();
        console.log( await generatePresignedUrl());
    } catch (error) {
        console.error(error.message);
    }  
};

module.exports = generateThumbnail;