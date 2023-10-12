/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ImportExportTemplateRun } from '../../../model/ImportExportTemplateRun';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';

export class ImportExportTemplateRunTableContentProvider extends TableContentProvider<ImportExportTemplateRun> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<ImportExportTemplateRun>>> {
        let objects = [];
        // first object id is template id
        if (this.contextId && this.objectIds && this.objectIds[0]) {
            const context = ContextService.getInstance().getActiveContext();
            objects = context ? await context.getObjectList('RUNS_OF_TEMPLATE_' + this.objectIds[0]) : [];
        }
        return await this.getRowObjects(objects);
    }
}
