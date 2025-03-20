/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { QueueDialogUtil } from '../../../ticket/webapp/core/admin/QueueDialogUtil';
import { DynamicField } from '../../model/DynamicField';
import { NewDynamicFieldDialogContext } from './NewDynamicFieldDialogContext';

export class DynamicFieldDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/dynamicfields', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

    public canRun(): boolean {
        return this.data.getSelectedRows()?.length === 1;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const dynamicField: DynamicField = this.data.getSelectedRows()[0]?.getRowObject().getObject();
            ContextService.getInstance().setActiveContext(NewDynamicFieldDialogContext.CONTEXT_ID, dynamicField.ID);
        }
    }
}
