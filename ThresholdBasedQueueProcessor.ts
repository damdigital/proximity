import { QueueProcessorInterface } from "./QueueProcessor";
import { mkGUID } from "./modules/Utils";
import { QueueEntry } from "./types";

export class ThresholdBasedQueueProcessor<T> implements QueueProcessorInterface<T> {
    private queue: QueueEntry<T>[] = [];
    private isProcessing: boolean = false;
    private guid: string;
    private addedToQueue: Map<string, number> = new Map<string, number>();

    constructor(private processItem: (item: T) => Promise<void>, private getIdentifier: (item: T) => string, private threshold: number) {
        this.guid = mkGUID()
        console.log('Constructing Queue Processor', { guid: this.guid })
    }

    private async processQueue() {
        while (this.queue.length > 0) {
            console.log(`Queue: ${JSON.stringify({ guid: this.guid, queue: this.queue }, null, 2)}`)
            // console.log(`Processing queue`, { guid: this.guid, length: this.queue.length })
            const entry = this.queue.shift(); // Remove the item from the queue
            if (entry) {
                const key = this.getIdentifier(entry.item)
                await this.processItem(entry.item); // Process the item asynchronously
            }
        }
        this.isProcessing = false;
    }

    push(item: T) {
        const now = Date.now()
        console.log(`Push called`, { guid: this.guid, item })
        const key = this.getIdentifier(item)
        const processedTimestamp = this.addedToQueue.get(key)
        if (processedTimestamp === undefined || now - processedTimestamp > this.threshold) {
            console.log(`Item pushed to queue`, { guid: this.guid, item })
            this.addedToQueue.set(key, Date.now())
            this.queue.push({ item, timestamp: now });
        } else {
            console.log(`Item already been processed ${now - processedTimestamp} ms ago`, { guid: this.guid, key })
        }
        if (!this.isProcessing) {
            this.isProcessing = true;
            this.processQueue();
        }
    }

}