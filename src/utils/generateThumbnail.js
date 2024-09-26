const s3 = require("./s3.js");
const path = require("path");
const generateThumbnailImage = require("./ffmpeg.js");
const fs = require("fs");

const generateThumbnail = async (bucketName, key) => {
    const filePathOnDisk = path.join(process.env.THUMBNAIL_FILES_LOCATION, key);
    const thumbnailPathOnDisk = path.join(process.env.THUMBNAIL_FILES_LOCATION, 'thumbnail-' + key + '.png');
    
    const downloadFile = async () => {
        return await s3.getFile(bucketName, key);
    };

    const createThumbnail = async () => {
        return await generateThumbnailImage(filePathOnDisk, thumbnailPathOnDisk);
    };

    const uploadFile = async () => {
        return await s3.uploadFile(bucketName, 'thumbnail-' + key + '.png', thumbnailPathOnDisk);
    };

    const deleteFiles = async () => {
        fs.unlinkSync(filePathOnDisk);
        fs.unlinkSync(thumbnailPathOnDisk);
        return;
    };

    try {
        await downloadFile();
        await createThumbnail();
        await uploadFile();
        await deleteFiles();
    } catch (error) {
        console.error(error.message);
    }  
};

module.exports = generateThumbnail;