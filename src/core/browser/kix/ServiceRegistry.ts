import { KIXObjectType } from "../../model";
import { ServiceType } from "./ServiceType";
import { IKIXService } from "./IKIXService";

export class ServiceRegistry {

    private static INSTANCE: ServiceRegistry;

    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.INSTANCE) {
            ServiceRegistry.INSTANCE = new ServiceRegistry();
        }
        return ServiceRegistry.INSTANCE;
    }

    private constructor() { }

    private services: IKIXService[] = [];

    public registerServiceInstance(service: IKIXService): void {
        this.services.push(service);
    }

    public getServiceInstance<T extends IKIXService>(
        kixObjectType: KIXObjectType, serviceType: ServiceType = ServiceType.OBJECT
    ): T {
        const service = this.services.find((s) => s.isServiceType(serviceType) && s.isServiceFor(kixObjectType));
        return service ? service as T : null;
    }

}
