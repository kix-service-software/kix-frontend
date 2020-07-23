/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../modules/base-components/webapp/core/AbstractAction';
import { ITable } from '../../../base-components/webapp/core/table';
import { IEventSubscriber } from '../../../../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../model/IdService';
import { BulkService, BulkDialogContext } from '.';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { EventService } from '../../../../modules/base-components/webapp/core/EventService';
import { DialogEvents } from '../../../../modules/base-components/webapp/core/DialogEvents';
import { ContextMode } from '../../../../model/ContextMode';
import { DialogEventData } from '../../../../modules/base-components/webapp/core/DialogEventData';


export class BulkAction extends AbstractAction<ITable> implements IEventSubscriber {

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
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(
            BulkDialogContext.CONTEXT_ID
        );

        if (context) {
            context.setObjectList(this.objectType, selectedObjects);
        }

        context.setDialogSubscriberId(this.eventSubscriberId);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_CANCELED, this);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_FINISHED, this);

        ContextService.getInstance().setDialogContext(BulkDialogContext.CONTEXT_ID, null, ContextMode.EDIT_BULK);
    }

    public async eventPublished(data: DialogEventData, eventId: string, subscriberId: string): Promise<void> {
        if (data && data.dialogId === 'bulk-dialog' && subscriberId === this.eventSubscriberId) {
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_CANCELED, this);
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_FINISHED, this);

            if (eventId === DialogEvents.DIALOG_FINISHED) {
                this.data.selectNone();
            }

            let selectedObjects: KIXObject[];
            if (eventId === DialogEvents.DIALOG_CANCELED) {
                selectedObjects = this.data.getSelectedRows().map((r) => r.getRowObject().getObject());
            }

            const bulkManager = BulkService.getInstance().getBulkManager(this.objectType);
            if (bulkManager && bulkManager.getBulkRunState()) {
                const tableConstextId = this.data.getContextId();
                const context = tableConstextId ? await ContextService.getInstance().getContext(tableConstextId) : null;

                if (context) {
                    await context.reloadObjectList(this.data.getObjectType());
                } else {
                    await this.data.reload();
                }
                if (selectedObjects && selectedObjects.length) {
                    selectedObjects.forEach((o) => this.data.selectRowByObject(o));
                }
            }
        }
    }
}
