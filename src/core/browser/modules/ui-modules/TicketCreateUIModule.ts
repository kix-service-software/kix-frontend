/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory } from '../../../../core/browser';
import { NewTicketDialogContext, TicketCreateAction } from '../../../../core/browser/ticket';
import { ContextDescriptor, KIXObjectType, ContextType, ContextMode } from '../../../../core/model';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 102;

    public name: string = 'TicketCreateUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        this.registerContexts();
        this.registerTicketActions();
    }

    private async registerContexts(): Promise<void> {
        const newTicketContext = new ContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-ticket-dialog', ['tickets'], NewTicketDialogContext
        );
        await ContextService.getInstance().registerContext(newTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-create-action', TicketCreateAction);
    }

}
