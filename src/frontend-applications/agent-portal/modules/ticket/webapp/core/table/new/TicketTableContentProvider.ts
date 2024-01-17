/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../table/webapp/core/TableContentProvider';
import { Ticket } from '../../../../model/Ticket';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { Table } from '../../../../../table/model/Table';

export class TicketTableContentProvider extends TableContentProvider<Ticket> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string,
        objects?: KIXObject[]
    ) {
        super(KIXObjectType.TICKET, table, objectIds, loadingOptions, contextId, objects);
        this.useBackendSort = true;
    }

    protected async prepareLoadingOptions(): Promise<KIXObjectLoadingOptions> {
        const loadingOptions = await super.prepareLoadingOptions();

        const ignoreDFDisplayValueTypes: [string, string] = [
            'NoDynamicFieldDisplayValues',
            'CheckList,ITSMConfigItemReference,TicketReference'
        ];

        if (loadingOptions?.query) {
            loadingOptions.query.push(ignoreDFDisplayValueTypes);
        } else {
            loadingOptions.query = [ignoreDFDisplayValueTypes];
        }

        return loadingOptions;
    }
}
