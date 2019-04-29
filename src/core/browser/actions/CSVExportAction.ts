import { AbstractAction } from '../../model/components/action/AbstractAction';
import { LabelService } from '../LabelService';
import { ITable, TableExportUtil } from '../table';

export class CSVExportAction extends AbstractAction<ITable> {

    public async initAction(): Promise<void> {
        this.text = "Translatable#CSV-Export";
        this.icon = "kix-icon-export";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && !!selectedRows.length;
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data);
        }
    }

}
