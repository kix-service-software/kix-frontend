import { QueueRequestObject } from "./QueueRequestObject";

export class CUQueueRequest {

    public Queue: QueueRequestObject;

    public constructor(queue: QueueRequestObject) {
        this.Queue = queue;
    }

}
