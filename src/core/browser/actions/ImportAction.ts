import { AbstractAction } from '../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType } from '../../model';
import { ContextService } from '../context';
import { ITable } from '../table';
import { ImportDialogContext, ImportService } from '../import';

export class ImportAction extends AbstractAction<ITable> {

    public objectType: KIXObjectType;

    public initAction(): void {
        this.text = "Import";
        this.icon = "kix-icon-import";
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

        ContextService.getInstance().setDialogContext(ImportDialogContext.CONTEXT_ID, null, ContextMode.IMPORT);
    }
}
