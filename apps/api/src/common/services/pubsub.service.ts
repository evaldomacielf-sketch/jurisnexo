import { Injectable, OnModuleInit } from '@nestjs/common';
import { PubSub, Message } from '@google-cloud/pubsub';

@Injectable()
export class PubSubService implements OnModuleInit {
    private pubSubClient: PubSub;

    onModuleInit() {
        this.pubSubClient = new PubSub();
    }

    /**
     * Batch Processor Implementation
     * Collects messages and processes them in bulk
     */
    async subscribeWithBatchProcessing(
        subscriptionName: string,
        processBatch: (messages: Message[]) => Promise<void>,
        batchSize = 100,
        maxWaitTimeMs = 1000 // 1 second
    ) {
        console.log(`🎧 Subscribing to ${subscriptionName} with batch processing...`);
        const subscription = this.pubSubClient.subscription(subscriptionName, {
            flowControl: {
                maxMessages: batchSize, // Flow control matches batch size
            },
        });

        let currentBatch: Message[] = [];
        let timer: NodeJS.Timeout | null = null;

        const flushBatch = async () => {
            if (currentBatch.length === 0) return;

            const batchToProcess = [...currentBatch];
            currentBatch = []; // Reset immediately

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            try {
                console.log(`📦 Processing batch of ${batchToProcess.length} messages`);
                await processBatch(batchToProcess);
                // Ack all success
                batchToProcess.forEach(m => m.ack());
            } catch (e) {
                console.error('Error processing batch', e);
                // Nack all on failure to retry
                batchToProcess.forEach(m => m.nack());
            }
        };

        subscription.on('message', (message: Message) => {
            currentBatch.push(message);

            // If batch is full, flush immediately
            if (currentBatch.length >= batchSize) {
                flushBatch();
            }
            // If this is the new first message of a batch, start the timer
            else if (currentBatch.length === 1) {
                timer = setTimeout(flushBatch, maxWaitTimeMs);
            }
        });

        subscription.on('error', (error) => {
            console.error(`Received error on ${subscriptionName}:`, error);
        });
    }
}
