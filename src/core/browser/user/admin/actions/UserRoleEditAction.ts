/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, KIXObjectType, ContextMode } from '../../../../model';
import { ContextService } from '../../../context';
import { RoleDetailsContext, EditUserRoleDialogContext } from '../context';

export class UserRoleEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
            RoleDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditUserRoleDialogContext.CONTEXT_ID, KIXObjectType.ROLE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
