/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { Row } from '../../../../table/model/Row';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { NewMailFilterDialogContext } from '../context';

export class MailFilterTableDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/communication/mailfilters', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && selectedRows.length && selectedRows.length === 1;
        }
        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const selectedRows: Row = this.data.getSelectedRows();
            const id = selectedRows[0].getRowObject().getObject().ID;
            if (id) {
                ContextService.getInstance().setActiveContext(NewMailFilterDialogContext.CONTEXT_ID, id);
            }
        }
    }
}
