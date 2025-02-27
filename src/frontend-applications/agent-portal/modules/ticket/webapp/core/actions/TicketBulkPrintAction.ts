/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AgentService } from '../../../../user/webapp/core/AgentService';

export class TicketBulkPrintAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Bulk Print';
        this.icon = 'kix-icon-print';
    }

    public async canShow(): Promise<boolean> {
        let show = false;

        const permissions = [
            new UIComponentPermission('tickets', [CRUD.READ])
        ];

        show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        return show;
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {

        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            const objectIds = objects.map((t) => t.TicketID);

            BrowserUtil.openInfoOverlay('Translatable#Prepare Tickets to print & zip');

            const currentUser = await AgentService.getInstance().getCurrentUser();
            const file = await KIXObjectService.loadObjects(
                KIXObjectType.HTML_TO_PDF, null,
                new KIXObjectLoadingOptions(
                    null, null, null, null, null,
                    [
                        ['TemplateName', 'Ticket'],
                        ['IdentifierType', 'IDKey'],
                        ['IdentifierIDorNumber', objectIds.join(',')],
                        ['UserID', currentUser.UserID.toString()],
                        ['Filename', 'Ticket_<KIX_TICKET_TicketNumber>_<TIME_YYMMDD_hhmm>'],
                        ['Compress', 1]
                    ]
                ), null, null, false
            );

            if (file && file[0]) {
                BrowserUtil.openSuccessOverlay('Translatable#Tickets has been printed and zipped');
                BrowserUtil.startBrowserDownload(
                    file[0]['Filename'], file[0]['Content'], file[0]['ContentType'], true
                );
            }
        }
    }
}
