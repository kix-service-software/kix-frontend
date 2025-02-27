/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { TicketDialogUtil } from '../../../../ticket/webapp/core';
import { Table } from '../../../../table/model/Table';
import { ConfigItem } from '../../../model/ConfigItem';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class CMDBCreateTicketAction extends AbstractAction<Table> {

    public hasLink: boolean = true;

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject<ConfigItem>().getObject());
            const configItemIds = objects.map((o) => o.ConfigItemID);
            TicketDialogUtil.createTicket(
                undefined, undefined, undefined, undefined,
                [[`${KIXObjectType.CONFIG_ITEM}-ID`, configItemIds]]
            );
        }
    }

}