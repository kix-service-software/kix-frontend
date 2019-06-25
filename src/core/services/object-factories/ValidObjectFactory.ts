import { ObjectFactory } from "./ObjectFactory";
import { ValidObject, KIXObjectType } from "../../model";

export class ValidObjectFactory extends ObjectFactory<ValidObject> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.VALID_OBJECT;
    }

    public create(valid?: ValidObject): ValidObject {
        return new ValidObject(valid);
    }


}
