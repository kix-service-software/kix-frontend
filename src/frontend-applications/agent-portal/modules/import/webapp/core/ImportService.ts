/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ImportManager } from './ImportManager';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class ImportService {

    private static INSTANCE: ImportService;

    public static getInstance(): ImportService {
        if (!ImportService.INSTANCE) {
            ImportService.INSTANCE = new ImportService();
        }
        return ImportService.INSTANCE;
    }

    private constructor() { }

    private importManager: ImportManager[] = [];

    public registerImportManager(importManager: ImportManager): void {
        this.importManager.push(importManager);
    }

    public getImportManager(objectType: KIXObjectType | string): ImportManager {
        return this.importManager.find((bm) => bm.objectType === objectType);
    }

    public initImportManager(objectType: KIXObjectType | string): void {
        const importManager = this.importManager.find((bm) => bm.objectType === objectType);
        if (importManager) {
            importManager.init();
        }
    }

    public hasImportManager(objectType: KIXObjectType | string): boolean {
        return this.getImportManager(objectType) !== undefined;
    }

}
