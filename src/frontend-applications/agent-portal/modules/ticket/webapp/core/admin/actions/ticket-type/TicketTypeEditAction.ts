/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EditTicketTypeDialogContext } from '../..';
import { AuthenticationSocketClient } from '../../../../../../base-components/webapp/core/AuthenticationSocketClient';

export class TicketTypeEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        const permissions = [
            new UIComponentPermission(`system/ticket/types/${objectId}`, [CRUD.UPDATE], false, 'Object', false)
        ];

        show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        return show;
    }

    public async run(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setActiveContext(EditTicketTypeDialogContext.CONTEXT_ID, id);
            }
        }
    }

}
