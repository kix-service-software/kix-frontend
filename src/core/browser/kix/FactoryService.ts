import { KIXObjectType, KIXObject } from "../../model";
import { IKIXObjectFactory } from "./IKIXObjectFactory";

export class FactoryService {

    private static INSTANCE: FactoryService;

    public static getInstance(): FactoryService {
        if (!FactoryService.INSTANCE) {
            FactoryService.INSTANCE = new FactoryService();
        }
        return FactoryService.INSTANCE;
    }

    private constructor() { }

    private fatcories: Map<KIXObjectType, IKIXObjectFactory<any>> = new Map();

    public registerFactory<T extends KIXObject>(kixObjectType: KIXObjectType, factory: IKIXObjectFactory<T>): void {
        this.fatcories.set(kixObjectType, factory);
    }

    public async create<T extends KIXObject>(kixObjectType: KIXObjectType, object: T): Promise<T> {
        const factory = this.fatcories.get(kixObjectType);
        if (factory) {
            return await factory.create(object);
        }
        return object;
    }

}
