const amqp = require('amqplib/callback_api');

const initialize = async () => {
    console.log('Initializing RabbitMQ');

    amqp.connect('amqp://localhost', (error, connection) => {
      if (error) {
        console.error('Error connecting to RabbitMQ: ', error);
        throw error;
      }
      console.log('Connected to RabbitMQ');

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

          channel.consume('thumbnailer', (message) => {
            console.log(message.content.toString());
            channel.ack(message);
          }, { noAck: false });
        });
      });
    })

};

module.exports = rabbit = {
    initialize: initialize
}