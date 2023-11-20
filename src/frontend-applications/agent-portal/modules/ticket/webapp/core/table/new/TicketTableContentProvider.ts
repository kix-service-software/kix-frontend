/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TicketProperty } from '../../../../model/TicketProperty';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';

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

    protected getSortAttribute(attribute: string): string {
        switch (attribute) {
            case TicketProperty.CONTACT_ID:
                return 'Contact';
            case TicketProperty.LOCK_ID:
                return 'Lock';
            case TicketProperty.ORGANISATION_ID:
                return 'Organisation';
            case TicketProperty.OWNER_ID:
                return 'Owner';
            case TicketProperty.PRIORITY_ID:
                return 'Priority';
            case TicketProperty.QUEUE_ID:
                return 'Queue';
            case TicketProperty.RESPONSIBLE_ID:
                return 'Responsible';
            case TicketProperty.STATE_ID:
                return 'State';
            case TicketProperty.TYPE_ID:
                return 'Type';
            case TicketProperty.CREATED:
                return KIXObjectProperty.CREATE_TIME;
            case TicketProperty.CHANGED:
                return KIXObjectProperty.CHANGE_TIME;
            default:
        }
        return super.getSortAttribute(attribute);
    }

}
