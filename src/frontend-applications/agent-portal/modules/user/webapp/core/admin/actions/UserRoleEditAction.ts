/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { EditUserRoleDialogContext } from '../context/EditUserRoleDialogContext';

export class UserRoleEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setActiveContext(EditUserRoleDialogContext.CONTEXT_ID, id);
            }
        }
    }

}
