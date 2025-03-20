/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ServiceType } from './ServiceType';
import { IKIXService } from './IKIXService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IAdditionalTableObjectsHandler } from './IAdditionalTableObjectsHandler';

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

    private additionalTableObjectsHandler: Map<string, IAdditionalTableObjectsHandler> = new Map();

    public static registerServiceInstance(service: IKIXService): void {
        if (service) {
            const registry = ServiceRegistry.getInstance();
            registry.services.push(service);
        }
    }

    public static registerAdditionalTableObjectsHandler(handler: IAdditionalTableObjectsHandler): void {
        if (handler) {
            ServiceRegistry.getInstance().additionalTableObjectsHandler.set(handler.handlerId, handler);
        }
    }

    public static getServiceInstance<T extends IKIXService>(
        kixObjectType: KIXObjectType | string, serviceType: ServiceType = ServiceType.OBJECT
    ): T {
        const registry = ServiceRegistry.getInstance();
        const service = registry.services.find((s) => s.isServiceType(serviceType) && s.isServiceFor(kixObjectType));
        return service ? service as T : null;
    }

    public static getAdditionalTableObjectsHandler(id: string): IAdditionalTableObjectsHandler {
        return ServiceRegistry.getInstance().additionalTableObjectsHandler.get(id);
    }

}
