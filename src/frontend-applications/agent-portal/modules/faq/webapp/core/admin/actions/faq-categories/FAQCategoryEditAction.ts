/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../../../../modules/base-components/webapp/core/ContextService';
import { EditFAQCategoryDialogContext } from '../..';

export class FAQCategoryEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/faq/categories', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setActiveContext(EditFAQCategoryDialogContext.CONTEXT_ID, id);
            }
        }
    }

}
