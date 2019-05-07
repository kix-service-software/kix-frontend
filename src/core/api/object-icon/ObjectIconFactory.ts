import { IObjectFactory, ObjectIcon, KIXObjectType } from "../../model";

export class ObjectIconFactory implements IObjectFactory<ObjectIcon> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.OBJECT_ICON;
    }

    public create(icon?: ObjectIcon): ObjectIcon {
        return new ObjectIcon(undefined, undefined, undefined, undefined, icon);
    }

}
