import { IObjectFactory } from "../IObjectFactory";
import { Lock } from "../Lock";
import { KIXObjectType } from "../KIXObjectType";

export class LockFactory implements IObjectFactory<Lock> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.QUEUE;
    }

    public create(lock?: Lock): Lock {
        return new Lock(lock);
    }


}
