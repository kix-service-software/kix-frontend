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
        return new ObjectIcon(null, null, null, null, objectIcon);
    }

}
