/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { AbstractAction } from '../../../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { Table } from '../../../../../table/model/Table';
import { ConfigItemClass } from '../../../../model/ConfigItemClass';
import { NewConfigItemClassDialogContext } from '../context';

export class ConfigItemClassDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

    public canRun(): boolean {
        return this.data?.getSelectedRows()?.length === 1;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const table = this.data as Table;
            const ciClass = table.getSelectedRows()[0].getRowObject()?.getObject() as ConfigItemClass;
            ContextService.getInstance().setActiveContext(NewConfigItemClassDialogContext.CONTEXT_ID, ciClass.ID);
        }
    }
}
