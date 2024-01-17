import { createLogger } from "./modules/Log";
import { mkGUID } from "./modules/Utils";

const logger = createLogger('QueueProcessor');
const console = logger

export interface QueueProcessorInterface<T> {
    push(item: T): void;
}

export class QueueProcessor<T> implements QueueProcessorInterface<T> {
    private queue: T[] = [];
    private intervalId: ReturnType<typeof setTimeout> | null = null;
    private isProcessing: boolean = false;
    private guid: string;

    constructor(private processItem: (item: T) => Promise<void>, private interval: number) {
        this.guid = mkGUID()
        console.log('Constructing Queue Processor', { guid: this.guid, interval })
    }

    push(item: T) {
        console.log(`Item pushed to queue`, { guid: this.guid, item })
        this.queue.push(item);
    }

    start() {
        console.log(`Queue Processor has been started`, { guid: this.guid })
        if (this.intervalId) {
            console.log("Processor is already running.", { guid: this.guid });
            return;
        }

        this.intervalId = setInterval(async () => {
            console.log(`Processing queue`, { guid: this.guid, length: this.queue.length, isProcessing: this.isProcessing })
            if (this.queue.length > 0 && !this.isProcessing) {
                this.isProcessing = true;
                const item = this.queue.shift(); // Remove the item from the queue
                if (item) {
                    await this.processItem(item); // Process the item
                }
                this.isProcessing = false;
            }
        }, this.interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}