import { KIXObjectType } from "../model";
import { IKIXObjectService } from "./IKIXObjectService";

export class KIXObjectServiceRegistry {

    private static INSTANCE: KIXObjectServiceRegistry;

    public static getInstance(): KIXObjectServiceRegistry {
        if (!KIXObjectServiceRegistry.INSTANCE) {
            KIXObjectServiceRegistry.INSTANCE = new KIXObjectServiceRegistry();
        }
        return KIXObjectServiceRegistry.INSTANCE;
    }

    private constructor() { }

    private services: IKIXObjectService[] = [];

    public registerServiceInstance(service: IKIXObjectService): void {
        this.services.push(service);
    }

    public getServiceInstance<T extends IKIXObjectService = IKIXObjectService>(kixObjectType: KIXObjectType): T {
        return this.services.find((s) => s.isServiceFor(kixObjectType)) as T;
    }

}
