/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { TicketListContext } from "..";


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
        const ticketIds = this.data as number[];
        const context = await ContextService.getInstance().getContext<TicketListContext>(TicketListContext.CONTEXT_ID);
        await context.loadTickets(ticketIds, this.text);
        await ContextService.getInstance().setContext(TicketListContext.CONTEXT_ID, null, null, null, null, false);
    }

}
