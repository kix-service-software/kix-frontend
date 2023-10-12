/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketListContext } from '..';


export class ShowUserTicketsAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        return;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public async run(): Promise<void> {
        const ticketStatsproperty = this.data as string;

        await ContextService.getInstance().setActiveContext(
            TicketListContext.CONTEXT_ID, ticketStatsproperty, null,
            [['TicketStatsProperty', ticketStatsproperty]]
        );

        const context = ContextService.getInstance().getActiveContext() as TicketListContext;
        context.setDisplayText(this.text);
        context.setIcon(this.icon);
    }

}
