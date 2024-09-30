const { createClient } = require("redis");
const log = require("../middlewares/log.js");

// Config for Redis is stored in .env file, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
const redisClient = createClient({
    url: 'redis://' + process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    log: log,
});

const redisPutS3Url = async (key, value, ttl) => {
    try {
        return await redisClient.set(key, value, { EX: ttl });
    } catch (err) {
        log.error(`Error Occurred Setting Redis Key: ${err}`);
        return err;
    } finally {
        log.debug(`Redis Set for Key: ${key} Completed`);
    }
};

const redisDeleteS3Url = async (key) => {
    try {
        return await redisClient.del(key);
    } catch (err) {
        log.error(`Error Occurred Deleting Redis Key: ${err}`);
        return err;
    } finally {
        log.debug(`Redis Delete for Key: ${key} Completed`);
    }
};

const connect = async (retries = process.env.REDIS_RETRY_CONNECTION_ATTEMPTS, delay = process.env.REDIS_CONNECTION_RETRY_DELAY) => {
    return new Promise(async (resolve, reject) => {
        if (redisClient.isOpen) {
            logger.debug("Redis Connection Already Open");
            return resolve();
        }

        await redisClient.connect().then(async (connection, error) => {
            if (error) {
                if (retries === 0) {
                    return reject(new Error('Error connecting to Redis: ' + error));
                }
                console.error('Error connecting to Redis. Retrying...', error);
                setTimeout(() => {
                    attemptConnection(retries - 1, delay).then(resolve).catch(reject);
                }, delay);
            } else {
                console.log('Connected to Redis');
                resolve();
            }
        });
    });
  };


module.exports = { 
    redisPutS3Url,
    redisDeleteS3Url,
    connect,
    redisClient
};