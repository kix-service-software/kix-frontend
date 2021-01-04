/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ServiceType } from './ServiceType';
import { IKIXService } from './IKIXService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IObjectReferenceHandler } from './IObjectReferenceHandler';

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

    private objectReferenceHandler: Map<string, IObjectReferenceHandler> = new Map();

    public static registerServiceInstance(service: IKIXService): void {
        if (service) {
            const registry = ServiceRegistry.getInstance();
            registry.services.push(service);
        }
    }

    public static registerObjectReferenceHandler(id: string, handler: IObjectReferenceHandler): void {
        if (handler) {
            ServiceRegistry.getInstance().objectReferenceHandler.set(id, handler);
        }
    }

    public static getServiceInstance<T extends IKIXService>(
        kixObjectType: KIXObjectType | string, serviceType: ServiceType = ServiceType.OBJECT
    ): T {
        const registry = ServiceRegistry.getInstance();
        const service = registry.services.find((s) => s.isServiceType(serviceType) && s.isServiceFor(kixObjectType));
        return service ? service as T : null;
    }

    public static getObjectReferenceHandler(id: string): IObjectReferenceHandler {
        return ServiceRegistry.getInstance().objectReferenceHandler.get(id);
    }

}
