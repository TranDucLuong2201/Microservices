const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange('user_events', 'topic', { durable: true });

        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('RabbitMQ connection failed:', error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

async function publishEvent(exchange, routingKey, data) {
    if (!channel) {
        console.error('RabbitMQ channel not ready');
        return;
    }

    try {
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(data)),
            { persistent: true }
        );
        console.log(`Event published: ${routingKey}`);
    } catch (error) {
        console.error('Failed to publish event:', error);
    }
}

module.exports = { connectRabbitMQ, publishEvent };