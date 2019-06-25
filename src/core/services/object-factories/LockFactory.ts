import { ObjectFactory } from "./ObjectFactory";
import { Lock, KIXObjectType } from "../../model";

export class LockFactory extends ObjectFactory<Lock> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.LOCK;
    }

    public create(lock?: Lock): Lock {
        return new Lock(lock);
    }

}
