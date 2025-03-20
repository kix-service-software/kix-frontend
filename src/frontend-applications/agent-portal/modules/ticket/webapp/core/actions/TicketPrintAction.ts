/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AgentService } from '../../../../user/webapp/core/AgentService';

export class TicketPrintAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = 'kix-icon-print';
    }


    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        const permissions = [
            new UIComponentPermission(`tickets/${objectId}`, [CRUD.READ])
        ];

        show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        return show;
    }

    public async run(event: any): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            BrowserUtil.openInfoOverlay('Translatable#Prepare Ticket for print');

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
                        ['Filename', 'Ticket_<KIX_TICKET_TicketNumber>_<TIME_YYMMDD_hhmm>']
                    ]
                ), null, null, false
            );

            if (file && file[0]) {
                BrowserUtil.openSuccessOverlay('Translatable#Ticket has printed');
                BrowserUtil.startBrowserDownload(
                    file[0]['Filename'], file[0]['Content'], file[0]['ContentType'], true
                );
            }
        }
    }
}
