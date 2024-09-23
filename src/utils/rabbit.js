const amqp = require('amqplib/callback_api');

const initialize = async () => {
    console.log('Initializing RabbitMQ');

    const attemptConnection = async (retries = 5, delay = 2000) => {
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

    try {
        const connection = await attemptConnection();
        connection.createChannel((error, channel) => {
            if (error) {
                console.error('Error creating channel: ', error);
                throw error;
            }

            channel.assertQueue('thumbnailer', { }, (error, ok) => {
                if (error) {
                    console.error('Error creating queue: ', error);
                    throw error;
                }

                channel.consume('thumbnailer', async (message) => {
                    console.log(message.content.toString());
                    await channel.ack(message);
                }, { noAck: false });
            });
        });
    } catch (error) {
        console.error(error);
    }

};

module.exports = rabbit = {
    initialize: initialize
}