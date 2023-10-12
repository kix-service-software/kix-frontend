/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ImportExportTemplate } from '../../model/ImportExportTemplate';

export class ImportExportService extends KIXObjectService<ImportExportTemplate> {

    private static INSTANCE: ImportExportService = null;

    public static getInstance(): ImportExportService {
        if (!ImportExportService.INSTANCE) {
            ImportExportService.INSTANCE = new ImportExportService();
        }

        return ImportExportService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.IMPORT_EXPORT_TEMPLATE);
        this.objectConstructors.set(KIXObjectType.IMPORT_EXPORT_TEMPLATE, [ImportExportTemplate]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.IMPORT_EXPORT_TEMPLATE;
    }

    public getLinkObjectName(): string {
        return 'ImportExportTemplate';
    }

}
