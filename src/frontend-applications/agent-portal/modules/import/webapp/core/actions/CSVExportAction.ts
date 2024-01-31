/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { Table } from '../../../../table/model/Table';
import { TableExportUtil } from '../../../../table/webapp/core/TableExportUtil';

export class CSVExportAction extends AbstractAction<Table> {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#CSV-Export';
        this.icon = 'kix-icon-export';
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
