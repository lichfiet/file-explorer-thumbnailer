const s3 = require("../utils/s3.js");
const { redisDeleteS3Url } = require("../utils/redis.js");

const deleteThumbnail = async (bucketName, key) => {
    const thumbnailKey = 'thumbnail-' + key + '.png';
    
    const deleteFile = async () => await s3.deleteFile(bucketName, thumbnailKey)
    const invalidatePresignedUrl = async () => await redisDeleteS3Url(thumbnailKey);
    const invalidateCache = async () => await redisDeleteS3Url(thumbnailKey);


    try {
        await deleteFile();
        await invalidatePresignedUrl();
        await invalidateCache();
        console.log(`Deleted thumbnail for key: ${thumbnailKey}`);
    } catch (error) {
        console.error(error.message);
    }  
};

module.exports = deleteThumbnail;