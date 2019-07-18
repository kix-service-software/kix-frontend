/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

    public static async createObject<T extends KIXObject | string = any>(
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
