const express = require("express");
const router = express.Router();

const rabbit = require("../../utils/rabbit.js");
const redis = require("../../utils/redis.js");
// const dbController = require("../../utils/db.js");

router.get("/", async (req, res, next) => {

    const attemptRabbitConnection = async () => {
        return new Promise((resolve, reject) => {
            rabbit.connect().then(() => {
                console.log("Connection has been established successfully."); resolve();
            }).catch((error) => {
                console.error("Unable to connect to RabbitMQ:" + error); reject(new Error("Unable to connect to RabbitMQ: " + error));
            });
        });
    };

    // const attemptPostgresConnection = async () => {
    //     return new Promise((resolve, reject) => {
    //         dbController.connect().then(() => {
    //             console.log("Connection has been established successfully.");
    //             resolve();
    //         }).catch((error) => {
    //             console.error("Unable to connect to the database:" + error);
    //             reject(new Error("Unable to connect to the database: " + error));
    //         });
    //     });
    // };

    const attemptRedisConnection = async () => {
        return new Promise((resolve, reject) => {
            if (redis.redisClient.isOpen) {
                console.log("Redis Connection Already Open");
                resolve();
            }

            redis.connect().then(() => {
                console.log("Connection has been established successfully.");
                resolve();
            }).catch((error) => {
                console.error("Unable to connect to the Redis:" + error);
                reject(new Error("Unable to connect to the Redis: " + error));
            });
        });
    };

    try {

        await attemptRabbitConnection();
        // await attemptPostgresConnection();
        await attemptRedisConnection();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send("Server Ready");
    } catch (error) {
        next(error);  // Pass errors to the Express error handler
    }
});

module.exports = router;