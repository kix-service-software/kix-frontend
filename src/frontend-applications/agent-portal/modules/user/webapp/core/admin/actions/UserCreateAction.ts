/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { NewContactDialogContext } from '../../../../../customer/webapp/core/context/NewContactDialogContext';

export class UserCreateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('contacts', [CRUD.CREATE]),
        new UIComponentPermission('system/users', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New User';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.setAdditionalInformation('IS_AGENT_DIALOG', true);
        }
        ContextService.getInstance().setActiveContext(NewContactDialogContext.CONTEXT_ID);
    }

}
