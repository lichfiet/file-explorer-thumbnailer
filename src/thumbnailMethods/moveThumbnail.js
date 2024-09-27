const s3 = require("../utils/s3.js");
const path = require("path");
const ffmpegCreateThumbnail = require("../utils/ffmpeg.js");
const fs = require("fs");
const { redisPutS3Url } = require("../utils/redis.js");

const moveThumbnail = async (bucketName, key, newKey) => {

    const checkIfValidCacheRecord = async () => {
        const redisGetS3Url = require("../utils/redis.js");
        const cacheRecord = await redisGetS3Url(key);
        if (cacheRecord === null) {
            console.error(`No Cache Record for key: ${key}`);
            return false;
        } else {
            console.log(`Cache Record for key: ${key} exists`);
            return true;
        }
    };

    const moveCacheRecord = async () => {
        const redisDeleteS3Url = require("../utils/redis.js");
        await redisDeleteS3Url(key);

        const redisPutS3Url = require("../utils/redis.js");
        await redisPutS3Url(newKey, cacheRecord, process.env.REDIS_TTL);
    };

    const createNewPresignedUrl = async () => {
        const s3GeneratePresignedUrl = require("../utils/s3.js");
        const newPresignedUrl = await s3GeneratePresignedUrl(bucketName, 'thumbnail-' + newKey + '.png');
        return newPresignedUrl;
    };

    const cacheNewPresignedUrl = async () => {
        const redisPutS3Url = require("../utils/redis.js");
        await redisPutS3Url(newKey, newPresignedUrl, process.env.REDIS_TTL);
    };

    const deleteOldPresignedUrl = async () => {
        const redisDeleteS3Url = require("../utils/redis.js");
        await redisDeleteS3Url(key);
    };

    try {
        const isValidCacheRecord = await checkIfValidCacheRecord();
        if (isValidCacheRecord) {
            await moveCacheRecord();
            await deleteOldPresignedUrl();
            await cacheNewPresignedUrl();
        } else {
            await deleteOldPresignedUrl();
            await createNewPresignedUrl();
            await cacheNewPresignedUrl();
        }
        console.log(`Moved thumbnail for key: ${key} to new key: ${newKey}`);
    } catch (error) {
        console.error(error.message);
    }  
};

module.exports = moveThumbnail;