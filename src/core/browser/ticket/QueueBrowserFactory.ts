import { Queue } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class QueueBrowserFactory implements IKIXObjectFactory<Queue> {

    private static INSTANCE: QueueBrowserFactory;

    public static getInstance(): QueueBrowserFactory {
        if (!QueueBrowserFactory.INSTANCE) {
            QueueBrowserFactory.INSTANCE = new QueueBrowserFactory();
        }
        return QueueBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(queue: Queue): Promise<Queue> {
        return new Queue(queue);
    }

}
