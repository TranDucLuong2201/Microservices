// Azure Service Bus Configuration for RabbitMQ Replacement
// This file provides configuration for using Azure Service Bus instead of RabbitMQ

const { ServiceBusClient } = require('@azure/service-bus');

class AzureServiceBusClient {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.client = new ServiceBusClient(connectionString);
    }

    async createSender(queueName) {
        return this.client.createSender(queueName);
    }

    async createReceiver(queueName) {
        return this.client.createReceiver(queueName);
    }

    async publishMessage(queueName, message) {
        const sender = await this.createSender(queueName);
        try {
            await sender.sendMessages({
                body: message,
                contentType: 'application/json'
            });
            console.log(`Message sent to ${queueName}:`, message);
        } finally {
            await sender.close();
        }
    }

    async subscribeToQueue(queueName, messageHandler) {
        const receiver = await this.createReceiver(queueName);
        
        receiver.subscribe({
            processMessage: async (message) => {
                try {
                    await messageHandler(message.body);
                    await receiver.completeMessage(message);
                } catch (error) {
                    console.error('Error processing message:', error);
                    await receiver.abandonMessage(message);
                }
            },
            processError: async (args) => {
                console.error('Error in message processing:', args.error);
            }
        });

        console.log(`Subscribed to queue: ${queueName}`);
    }

    async close() {
        await this.client.close();
    }
}

// Environment variables for Azure Service Bus
const AZURE_SERVICE_BUS_CONFIG = {
    connectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
    queues: {
        userEvents: 'user-events',
        todoEvents: 'todo-events',
        authEvents: 'auth-events'
    }
};

module.exports = {
    AzureServiceBusClient,
    AZURE_SERVICE_BUS_CONFIG
};
