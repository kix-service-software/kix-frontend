/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../model/components/action/AbstractAction';
import { ITable, TableExportUtil } from '../table';

export class CSVExportAction extends AbstractAction<ITable> {

    public hasLink: boolean = false;

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
