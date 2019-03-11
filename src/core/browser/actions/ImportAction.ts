import { AbstractAction } from '../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType } from '../../model';
import { ContextService } from '../context';
import { ITable } from '../table';
import { ImportDialogContext, ImportService } from '../import';
import { IdService } from '../IdService';
import { EventService } from '../event';
import { DialogEvents, DialogEventData } from '../components/dialog';

export class ImportAction extends AbstractAction<ITable> {

    public eventSubscriberId: string;
    public objectType: KIXObjectType;

    public initAction(): void {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
        this.eventSubscriberId = IdService.generateDateBasedId('import-action-');
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            this.objectType = this.data.getObjectType();
            if (ImportService.getInstance().hasImportManager(this.objectType)) {
                await this.openDialog();
            } else {
                super.run(event);
            }
        }
    }

    private async openDialog(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ImportDialogContext>(
            ImportDialogContext.CONTEXT_ID
        );
        context.setAdditionalInformation([this.objectType]);

        context.setDialogSubscriberId(this.eventSubscriberId);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_CANCELED, this);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_FINISHED, this);

        ContextService.getInstance().setDialogContext(ImportDialogContext.CONTEXT_ID, null, ContextMode.IMPORT);
    }

    public async eventPublished(eventData: DialogEventData, eventId: string, subscriberId: string): Promise<void> {
        if (eventData && eventData.dialogId === 'import-dialog' && subscriberId === this.eventSubscriberId) {
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_CANCELED, this);
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_FINISHED, this);

            const importManager = ImportService.getInstance().getImportManager(this.objectType);
            if (importManager && importManager.getImportRunState()) {
                await this.data.reload();
            }
        }
    }
}
