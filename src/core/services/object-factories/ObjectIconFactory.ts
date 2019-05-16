import { ObjectFactory } from "./ObjectFactory";
import { ObjectIcon, KIXObjectType } from "../../model";

export class ObjectIconFactory extends ObjectFactory<ObjectIcon> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.OBJECT_ICON;
    }

    public create(icon?: ObjectIcon): ObjectIcon {
        return new ObjectIcon(undefined, undefined, undefined, undefined, icon);
    }

}
