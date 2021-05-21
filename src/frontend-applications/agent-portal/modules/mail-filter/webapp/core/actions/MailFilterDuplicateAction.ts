/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MailFilterDetailsContext } from '../context';
import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../model/ContextMode';

export class MailFilterDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/communication/mailfilters', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<MailFilterDetailsContext>(
            MailFilterDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    null, KIXObjectType.MAIL_FILTER, ContextMode.CREATE_ADMIN, id, true,
                    'Translatable#Communication: Email'
                );
            }
        }
    }

}
