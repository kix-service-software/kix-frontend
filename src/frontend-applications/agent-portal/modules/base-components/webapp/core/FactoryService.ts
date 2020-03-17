/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "./IKIXObjectFactory";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObject } from "../../../../model/kix/KIXObject";

export class FactoryService {

    private static INSTANCE: FactoryService;

    public static getInstance(): FactoryService {
        if (!FactoryService.INSTANCE) {
            FactoryService.INSTANCE = new FactoryService();
        }
        return FactoryService.INSTANCE;
    }

    private constructor() { }

    private fatcories: Map<KIXObjectType | string, IKIXObjectFactory<any>> = new Map();

    public registerFactory<T extends KIXObject>(
        kixObjectType: KIXObjectType | string, factory: IKIXObjectFactory<T>
    ): void {
        this.fatcories.set(kixObjectType, factory);
    }

    public async create<T extends KIXObject = any>(kixObjectType: KIXObjectType | string, object: T): Promise<T> {
        const factory = this.fatcories.get(kixObjectType);
        if (factory) {
            return await factory.create(object);
        }
        return object;
    }

}
