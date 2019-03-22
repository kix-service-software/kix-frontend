import { IObjectFactory, KIXObjectType, KIXObject } from "../model";

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

    public static createObject<T extends KIXObject = any>(objectType: KIXObjectType, object: T): T {
        const factory = this.getInstance().factories.find((f) => f.isFactoryFor(objectType));
        if (factory) {
            return factory.create(object);
        }
        return object;
    }


}
