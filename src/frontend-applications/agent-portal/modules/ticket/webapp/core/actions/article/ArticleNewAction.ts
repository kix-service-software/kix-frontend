/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { NewTicketArticleContext } from '../..';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { AdditionalContextInformation } from '../../../../../base-components/webapp/core/AdditionalContextInformation';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';

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
        ContextService.getInstance().setActiveContext(NewTicketArticleContext.CONTEXT_ID,
            undefined, undefined,
            [
                ['REFERENCED_TICKET_ID', this.ticketId],
                [
                    AdditionalContextInformation.DISPLAY_TEXT,
                    await TranslationService.translate(this.text)
                ],
                [AdditionalContextInformation.ICON, this.icon]
            ]
        );
    }

}
