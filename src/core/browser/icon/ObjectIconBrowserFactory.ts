import { ObjectIcon } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class ObjectIconBrowserFactory implements IKIXObjectFactory<ObjectIcon> {

    private static INSTANCE: ObjectIconBrowserFactory;

    public static getInstance(): ObjectIconBrowserFactory {
        if (!ObjectIconBrowserFactory.INSTANCE) {
            ObjectIconBrowserFactory.INSTANCE = new ObjectIconBrowserFactory();
        }
        return ObjectIconBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(objectIcon: ObjectIcon): Promise<ObjectIcon> {
        return new ObjectIcon(
            objectIcon.Object,
            objectIcon.ObjectID,
            objectIcon.ContentType,
            objectIcon.Content,
            objectIcon.ID,
            objectIcon.CreateBy,
            objectIcon.CreateTime,
            objectIcon.ChangeBy,
            objectIcon.ChangeTime
        );
    }

}
