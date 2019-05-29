import { IObjectFactory } from "../IObjectFactory";
import { ValidObject } from "./ValidObject";
import { KIXObjectType } from "../KIXObjectType";

export class ValidObjectFactory implements IObjectFactory<ValidObject> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.VALID_OBJECT;
    }

    public create(valid?: ValidObject): ValidObject {
        return new ValidObject(valid);
    }


}
