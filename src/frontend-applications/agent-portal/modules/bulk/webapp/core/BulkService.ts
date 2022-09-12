/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BulkManager } from './BulkManager';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { LinkManager } from '../../../links/webapp/core/LinkManager';

export class BulkService {

    private static INSTANCE: BulkService;

    public static getInstance(): BulkService {
        if (!BulkService.INSTANCE) {
            BulkService.INSTANCE = new BulkService();
        }
        return BulkService.INSTANCE;
    }

    private constructor() { }

    private bulkManager: BulkManager[] = [];
    private linkManager: LinkManager[] = [];

    public registerBulkManager(bulkmanager: BulkManager): void {
        this.bulkManager.push(bulkmanager);
    }

    public getBulkManager(objectType: KIXObjectType | string): BulkManager {
        return this.bulkManager.find((bm) => bm.objectType === objectType);
    }

    public initBulkManager(objectType: KIXObjectType | string, objects: KIXObject[]): void {
        const bulkManager = this.bulkManager.find((bm) => bm.objectType === objectType);
        if (bulkManager) {
            bulkManager.objects = objects;
            bulkManager.init();
        }
    }

    public hasBulkManager(objectType: KIXObjectType | string): boolean {
        return this.getBulkManager(objectType) !== undefined;
    }

    public registerLinkManager(linkManager: LinkManager): void {
        this.linkManager.push(linkManager);
    }

    public getLinkManager(objectType: KIXObjectType | string): LinkManager {
        return this.linkManager.find((lm) => lm.objectType === objectType);
    }

    public removeLinkManager(linkManager: LinkManager): void {
        const index = this.linkManager.indexOf(linkManager);
        if (index !== -1) {
            this.linkManager.splice(index, 1);
        }
    }

}
