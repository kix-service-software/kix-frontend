/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { UserDetailsContext } from '../context';
import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../../model/ContextMode';
import { EditContactDialogContext } from '../../../../../customer/webapp/core';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';

export class UserEditAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('contacts', [CRUD.CREATE]),
        new UIComponentPermission('system/users', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<UserDetailsContext>(
            UserDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                const dialogContext = await ContextService.getInstance().getContext(
                    EditContactDialogContext.CONTEXT_ID
                );
                if (dialogContext) {
                    dialogContext.reset();
                    dialogContext.setAdditionalInformation('IS_AGENT_DIALOG', true);
                    dialogContext.setAdditionalInformation('USER_ID', id);
                }
                ContextService.getInstance().setDialogContext(
                    EditContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT,
                    ContextMode.EDIT
                );
            }
        }
    }

}
