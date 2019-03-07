import { KIXObjectType } from "../../model";
import { ServiceType } from "./ServiceType";
import { IKIXService } from "./IKIXService";

export class ServiceRegistry {

    private static INSTANCE: ServiceRegistry;

    private static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.INSTANCE) {
            ServiceRegistry.INSTANCE = new ServiceRegistry();
        }
        return ServiceRegistry.INSTANCE;
    }

    private constructor() { }

    private services: IKIXService[] = [];

    public static registerServiceInstance(service: IKIXService): void {
        const registry = ServiceRegistry.getInstance();
        registry.services.push(service);
    }

    public static getServiceInstance<T extends IKIXService>(
        kixObjectType: KIXObjectType, serviceType: ServiceType = ServiceType.OBJECT
    ): T {
        const registry = ServiceRegistry.getInstance();
        const service = registry.services.find((s) => s.isServiceType(serviceType) && s.isServiceFor(kixObjectType));
        return service ? service as T : null;
    }

}
