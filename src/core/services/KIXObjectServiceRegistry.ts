import { KIXObjectType } from "../model";
import { IKIXObjectService } from "./IKIXObjectService";

export class KIXObjectServiceRegistry {

    private static INSTANCE: KIXObjectServiceRegistry;

    private static getInstance(): KIXObjectServiceRegistry {
        if (!KIXObjectServiceRegistry.INSTANCE) {
            KIXObjectServiceRegistry.INSTANCE = new KIXObjectServiceRegistry();
        }
        return KIXObjectServiceRegistry.INSTANCE;
    }

    private constructor() { }

    private services: IKIXObjectService[] = [];

    public static registerServiceInstance(service: IKIXObjectService): void {
        const registry = KIXObjectServiceRegistry.getInstance();
        registry.services.push(service);
    }

    public static getServiceInstance<T extends IKIXObjectService = IKIXObjectService>(kixObjectType: KIXObjectType): T {
        const registry = KIXObjectServiceRegistry.getInstance();
        return registry.services.find((s) => s.isServiceFor(kixObjectType)) as T;
    }

}
