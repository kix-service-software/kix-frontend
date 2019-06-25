import { ObjectFactory } from "./ObjectFactory";
import { Queue, KIXObjectType } from "../../model";

export class QueueFactory extends ObjectFactory<Queue> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.QUEUE;
    }

    public create(queue?: Queue): Queue {
        return new Queue(queue);
    }


}
