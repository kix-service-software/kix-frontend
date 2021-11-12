/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { TextModuleDialogUtil } from '../TextModuleDialogUtil';
import { Row } from '../../../../base-components/webapp/core/table';

export class TextModuleDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/textmodules', [CRUD.CREATE])
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
            const selectedRows: Row[] = this.data.getSelectedRows();
            TextModuleDialogUtil.duplicate(selectedRows[0].getRowObject().getObject());
        }
    }
}
