import { AbstractAction } from '../../model/components/action/AbstractAction';
import { StandardTable } from '../standard-table';
import { ContextMode } from '../../model';
import { DialogService } from '../dialog';
import { ContextService } from '../context';
import { BulkDialogContext } from '../bulk';

export class BulkAction extends AbstractAction<StandardTable> {

    public initAction(): void {
        this.text = "Sammelaktion";
        this.icon = "kix-icon-arrow-collect";
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
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(BulkDialogContext.CONTEXT_ID);
        const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();

        if (context) {
            context.setObjectList(selectedObjects);
        }

        ContextService.getInstance().setDialogContext(BulkDialogContext.CONTEXT_ID, null, ContextMode.EDIT_BULK);
    }

}
