/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { EditTicketDialogContext } from '../..';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { AdditionalContextInformation } from '../../../../../base-components/webapp/core/AdditionalContextInformation';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { FormService } from '../../../../../base-components/webapp/core/FormService';
import { FormContext } from '../../../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';

export class ArticleNewAction extends AbstractAction {

    private ticketId: number = null;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Article';
        this.icon = 'kix-icon-new-note';
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        if (objectId) {
            this.ticketId = Number(objectId);
            const permissions = [
                new UIComponentPermission(`tickets/${objectId}/articles`, [CRUD.CREATE])
            ];
            show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        }

        return show;
    }

    public async run(): Promise<void> {
        const editContext = await ContextService.getInstance().setActiveContext(EditTicketDialogContext.CONTEXT_ID,
            this.ticketId, undefined,
            [
                ['REFERENCED_SOURCE_OBJECT_ID', this.ticketId],
                [AdditionalContextInformation.FORM_ID, 'ticket-article-new-form']
            ]
        );
        editContext.setIcon(this.icon);
        editContext.setDisplayText(await TranslationService.translate(this.text));
    }

}
