/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { AgentService } from '../../../../../user/webapp/core/AgentService';
import { Article } from '../../../../model/Article';

export class ArticlePrintAction extends AbstractAction<Article> {

    private articleId: number = null;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = 'kix-icon-print';
    }

    public async setData(data: Article): Promise<void> {
        super.setData(data);
        this.articleId = this.data?.ArticleID;
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        if (objectId) {
            const permissions = [
                new UIComponentPermission(`tickets/${objectId}/articles`, [CRUD.READ])
            ];

            show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        }
        return show;
    }

    public async run(event: any): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            BrowserUtil.openInfoOverlay('Translatable#Prepare Article for print');

            const currentUser = await AgentService.getInstance().getCurrentUser();
            const ticketId = context.getObjectId();
            const file = await KIXObjectService.loadObjects(
                KIXObjectType.HTML_TO_PDF, null,
                new KIXObjectLoadingOptions(
                    null, null, null, null, null,
                    [
                        ['TemplateName', 'Ticket'],
                        ['IdentifierType', 'IDKey'],
                        ['IdentifierIDorNumber', ticketId.toString()],
                        ['UserID', currentUser.UserID.toString()],
                        ['Filters', '{"Article":{"AND":[{"Field":"ArticleID","Type":"EQ","Value":"' + this.articleId + '"}]}}'],
                        ['Filename', 'Ticket_<KIX_TICKET_TicketNumber>_' + this.articleId + '_<TIME_YYMMDD_hhmm>']
                    ]
                ), null, null, false
            );

            if (file && file[0]) {
                BrowserUtil.openSuccessOverlay('Translatable#Article has printed');
                BrowserUtil.startBrowserDownload(
                    file[0]['Filename'], file[0]['Content'], file[0]['ContentType'], true
                );
            }
        }
    }
}
