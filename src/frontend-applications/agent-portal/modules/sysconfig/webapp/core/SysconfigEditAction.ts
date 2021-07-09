/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Table } from '../../../base-components/webapp/core/table';
import { EditSysConfigDialogContext } from './context';

export class SysconfigEditAction extends AbstractAction<Table> {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
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
        const rows = this.data.getSelectedRows();
        const syconfigKeys = rows.map((r) => r.getRowObject().getObject());

        const editContext = await ContextService.getInstance().setActiveContext(EditSysConfigDialogContext.CONTEXT_ID);
        if (editContext) {
            editContext.setObjectList(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, syconfigKeys);
        }
    }
}
