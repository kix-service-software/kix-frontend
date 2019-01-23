import { AbstractAction } from '../../model/components/action/AbstractAction';
import { StandardTable } from '../standard-table';
import { ContextMode, KIXObjectType, KIXObject } from '../../model';
import { ContextService } from '../context';
import { BulkDialogContext, BulkService } from '../bulk';
import { EventService, IEventSubscriber } from '../event';
import { IdService } from '../IdService';
import { TableEvents, TableEventData, DialogEvents, DialogEventData } from '../components';

export class BulkAction extends AbstractAction<StandardTable> implements IEventSubscriber {

    public eventSubscriberId: string;
    public objectType: KIXObjectType;

    public initAction(): void {
        this.text = "Sammelaktion";
        this.icon = "kix-icon-arrow-collect";
        this.eventSubscriberId = IdService.generateDateBasedId('bulk-action-');
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data
            && this.data instanceof StandardTable
            && this.data.tableConfiguration.enableSelection
            && this.data.listenerConfiguration.selectionListener
        ) {
            const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
            canRun = selectedObjects && !!selectedObjects.length;
        }
        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();

            const objectType = selectedObjects[0].KIXObjectType;
            if (BulkService.getInstance().hasBulkManager(objectType)) {
                await this.openDialog(selectedObjects);
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
                this.data.listenerConfiguration.selectionListener.updateSelections([]);
            }

            // FIXME: Tabellen-Refresh nicht mehr notwendig, wenn  Refresh durchs Backend getriggert wird
            const bulkManager = BulkService.getInstance().getBulkManager(this.objectType);
            if (bulkManager && bulkManager.getBulkRunState()) {
                EventService.getInstance().publish(TableEvents.REFRESH, new TableEventData(this.data.tableId));
            }
        }
    }
}
