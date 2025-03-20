/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectService } from './IKIXObjectService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';

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

    public static getServiceInstance<T extends IKIXObjectService = IKIXObjectService>(
        kixObjectType: KIXObjectType | string
    ): T {
        const registry = KIXObjectServiceRegistry.getInstance();
        return registry.services.find((s) => s.isServiceFor(kixObjectType)) as T;
    }

}
