/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../modules/base-components/webapp/core/AbstractAction';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../model/IdService';
import { BulkService, BulkDialogContext } from '.';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { Table } from '../../../table/model/Table';

export class BulkAction extends AbstractAction<Table>  {

    public hasLink: boolean = false;

    public eventSubscriberId: string;
    public objectType: KIXObjectType | string;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Bulk Action';
        this.icon = 'kix-icon-arrow-collect';
        this.eventSubscriberId = IdService.generateDateBasedId('bulk-action-');
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public async canShow(): Promise<boolean> {
        return BulkService.getInstance().hasBulkManager(this.data.getObjectType());
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            this.objectType = this.data.getObjectType();
            if (BulkService.getInstance().hasBulkManager(this.objectType)) {
                await this.openDialog(objects);
            } else {
                super.run(event);
            }
        }
    }

    private async openDialog(selectedObjects: KIXObject[]): Promise<void> {
        const context = await ContextService.getInstance().setActiveContext(BulkDialogContext.CONTEXT_ID);
        if (context) {
            context.setObjectList(this.objectType, selectedObjects);
        }
    }

}
