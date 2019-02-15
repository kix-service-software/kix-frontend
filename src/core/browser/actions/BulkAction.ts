import { AbstractAction } from '../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType, KIXObject } from '../../model';
import { ContextService } from '../context';
import { BulkDialogContext, BulkService } from '../bulk';
import { EventService, IEventSubscriber } from '../event';
import { IdService } from '../IdService';
import { DialogEvents, DialogEventData } from '../components';
import { ITable } from '../table';

export class BulkAction extends AbstractAction<ITable> implements IEventSubscriber {

    public eventSubscriberId: string;
    public objectType: KIXObjectType;

    public initAction(): void {
        this.text = "Sammelaktion";
        this.icon = "kix-icon-arrow-collect";
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

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            const objectType = this.data.getObjectType();
            if (BulkService.getInstance().hasBulkManager(objectType)) {
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

        this.objectType = selectedObjects[0].KIXObjectType;

        if (context) {
            context.setObjectList(selectedObjects);
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
                await this.data.reload();
                if (selectedObjects && selectedObjects.length) {
                    selectedObjects.forEach((o) => this.data.selectRowByObject(o));
                }
            }
        }
    }
}
