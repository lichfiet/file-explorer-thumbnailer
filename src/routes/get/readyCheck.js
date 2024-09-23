const express = require("express");
const router = express.Router();

const dbController = require("../../utils/db.js");
const amqp = require('amqplib/callback_api');

router.get("/", async (req, res, next) => {
    const attemptRabbitConnection = async () => {
        return new Promise((resolve, reject) => {
            amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`, (error, connection) => {
                if (error) {
                    console.error('Error connecting to RabbitMQ. Retrying...', error);
                    return reject(new Error('Error connecting to RabbitMQ: ' + error));
                } else {
                    console.log('Connected to RabbitMQ');
                    resolve();
                }
            });
        });
    };

    const attemptPostgresConnection = async () => {
        return new Promise((resolve, reject) => {
            dbController.connect().then(() => {
                console.log("Connection has been established successfully.");
                resolve();
            }).catch((error) => {
                console.error("Unable to connect to the database:" + error);
                reject(new Error("Unable to connect to the database: " + error));
            });
        });
    };

    try {
        
        await attemptRabbitConnection();
        await attemptPostgresConnection();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send("Server Ready");
    } catch (error) {
        next(error);  // Pass errors to the Express error handler
    }
});

module.exports = router;