import { KIXObjectType, KIXObject } from "../model";
import { IObjectFactory } from "./object-factories/IObjectFactory";

export class ObjectFactoryService {

    private static INSTANCE: ObjectFactoryService;

    public static getInstance(): ObjectFactoryService {
        if (!ObjectFactoryService.INSTANCE) {
            ObjectFactoryService.INSTANCE = new ObjectFactoryService();
        }
        return ObjectFactoryService.INSTANCE;
    }

    private constructor() { }

    private factories: IObjectFactory[] = [];

    public static registerFactory(factory: IObjectFactory): void {
        this.getInstance().factories.push(factory);
    }

    public static async createObject<T extends KIXObject = any>(
        token: string, objectType: KIXObjectType, object: T
    ): Promise<T> {
        const factory = this.getInstance().factories.find((f) => f.isFactoryFor(objectType));
        if (factory) {
            object = factory.create(object);
            object = await factory.applyPermissions(token, object);
        }
        return object;
    }

}
