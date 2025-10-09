const amqp = require('amqplib');
const userService = require('../service/userService');

async function startEventConsumer() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange('user_events', 'topic', { durable: true });
        await channel.assertExchange('todo_events', 'topic', { durable: true });

        // Queue for user events
        const userQueue = await channel.assertQueue('user_service_queue', { durable: true });
        await channel.bindQueue(userQueue.queue, 'user_events', 'user.registered');

        // Queue for todo events
        const todoQueue = await channel.assertQueue('user_todo_queue', { durable: true });
        await channel.bindQueue(todoQueue.queue, 'todo_events', 'todo.created');
        await channel.bindQueue(todoQueue.queue, 'todo_events', 'todo.deleted');

        // Consume user events
        await channel.consume(userQueue.queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log('📥 Received event:', data);

                userService.handleUserRegistered(data);
                channel.ack(msg);
            }
        });

        // Consume todo events
        await channel.consume(todoQueue.queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;

                if (routingKey === 'todo.created') {
                    userService.incrementTodoCount(data.userId);
                } else if (routingKey === 'todo.deleted') {
                    userService.decrementTodoCount(data.userId);
                }

                channel.ack(msg);
            }
        });

        console.log('✅ User Service listening for events');
    } catch (error) {
        console.error('❌ Failed to start event consumer:', error);
        setTimeout(startEventConsumer, 5000);
    }
}

module.exports = { startEventConsumer };