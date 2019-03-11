import { AbstractAction, Version, ContextMode, KIXObjectType } from '../../../model';
import { ITable, Table } from '../../table';
import { ContextService } from '../../context';
import { CompareConfigItemVersionDialogContext } from '../context';

export class ConfigItemVersionCompareAction extends AbstractAction<ITable> {

    public initAction(): void {
        this.text = 'Translatable#Compare';
        this.icon = 'kix-icon-comparison-version';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data && this.data instanceof Table) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 1;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            await this.openDialog(objects);
        }
    }

    private async openDialog(versions: Version[]): Promise<void> {
        const context = await ContextService.getInstance().getContext<CompareConfigItemVersionDialogContext>(
            CompareConfigItemVersionDialogContext.CONTEXT_ID
        );

        if (context) {
            context.setObjectList(versions);
        }

        ContextService.getInstance().setDialogContext(
            CompareConfigItemVersionDialogContext.CONTEXT_ID,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE,
            ContextMode.EDIT
        );
    }
}
