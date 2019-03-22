import { IObjectFactory } from "../IObjectFactory";
import { Queue } from "../Queue";
import { KIXObjectType } from "../KIXObjectType";

export class QueueFactory implements IObjectFactory<Queue> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.QUEUE;
    }

    public create(queue?: Queue): Queue {
        return new Queue(queue);
    }


}
