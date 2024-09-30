const amqp = require('amqplib/callback_api');

let connection;
let rabbitChannel;

const attemptConnection = async (retries = process.env.RABBITMQ_RETRY_CONNECTION_ATTEMPTS, delay = process.env.RABBITMQ_RETRY_CONNECTION_TIMEOUT) => {
    return new Promise((resolve, reject) => {
        amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`, (error, connection) => {
            if (error) {
                if (retries === 0) {
                    return reject(new Error('Error connecting to RabbitMQ: ' + error));
                }
                console.error('Error connecting to RabbitMQ. Retrying...', error);
                setTimeout(() => {
                    attemptConnection(retries - 1, delay).then(resolve).catch(reject);
                }, delay);
            } else {
                console.log('Connected to RabbitMQ');
                resolve(connection);
            }
        });
    });
};

const initialize = async () => {
    console.log('Initializing RabbitMQ');

    connection = await attemptConnection();

    try {
        connection.createChannel((error, channel) => {
            rabbitChannel = channel;
            
            if (error) { console.error('Error creating channel: ', error); throw error; }
            
            
            // create queues
            channel.assertQueue('generateThumbnail', {}, (error, ok) => {
                if (error) {
                    console.error('Error creating queue: ', error); throw error;
                }
            });
            
            channel.assertQueue('deleteThumbnail', {}, (error, ok) => {
                if (error) {
                    console.error('Error creating queue: ', error); throw error;
                }
            });
            

            // consume messages
            channel.prefetch(1);
            channel.consume('generateThumbnail', async (message) => {
                const generateThumbnail = require("../thumbnailMethods/generateThumbnail.js");
                let mensaje = JSON.parse(message.content.toString());

                await generateThumbnail(mensaje.bucketName, mensaje.key);
                await channel.ack(message);
            }, { noAck: false });

            channel.prefetch(1);
            channel.consume('deleteThumbnail', async (message) => {
                const deleteThumbnail = require("../thumbnailMethods/deleteThumbnail.js");
                let mensaje = JSON.parse(message.content.toString());

                await deleteThumbnail(mensaje.bucketName, mensaje.key);
                await channel.ack(message);
            }, { noAck: false });
        });
    } catch (error) {
        console.error(error.message);
    }

};


module.exports = rabbit = {
    initialize: initialize,
    connect: attemptConnection
}