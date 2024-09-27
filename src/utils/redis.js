const { createClient } = require("redis");
const log = require("../middlewares/log.js");

// Config for Redis is stored in .env file, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
const redisClient = createClient({
    url: 'redis://' + process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    log: log,
});

const redisPutS3Url = async (key, url) => {
    try {
        return await redisClient.set(key, url);
    } catch (err) {
        log.error(`Error Occurred Setting Redis Key: ${err}`);
        return err;
    } finally {
        log.debug(`Redis Set for Key: ${key} Completed`);
    }
};

const connectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            log.debug("Redis Connection Already Open");
            return;
        } else {
            log.debug("Redis Connection Not Open, Opening Connection");
            await redisClient.connect();
        }
    } catch (err) {
        log.error(`Error Occurred Connecting to Redis: ${err}`);
        return err;
    } finally {
        log.debug(`Redis Connection Completed`);
    }
};


module.exports = { 
    redisPutS3Url,
    connectRedis,
    redisClient
};