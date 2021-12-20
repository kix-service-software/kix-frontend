/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
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
            // TODO: "Schalter" für "übersetzen/nich übersetzen" ermöglichen (Nachfrage-Overlay?)
            // im Moment nur für extra Organisation notwendig
            if (
                this.data.getObjectType() === KIXObjectType.ORGANISATION
            ) {
                TableExportUtil.export(this.data, undefined, false);
            } else {
                TableExportUtil.export(this.data);
            }
        }
    }

}
