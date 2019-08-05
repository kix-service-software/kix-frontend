/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory, DialogService } from '../../../../core/browser';
import { NewTicketDialogContext, TicketCreateAction } from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../../../core/model';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 102;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        this.registerContexts();
        this.registerTicketActions();
        this.registerTicketDialogs();
    }

    private registerContexts(): void {
        const newTicketContext = new ContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-ticket-dialog', ['tickets'], NewTicketDialogContext
        );
        ContextService.getInstance().registerContext(newTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-create-action', TicketCreateAction);
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-dialog',
            new WidgetConfiguration(
                'new-ticket-dialog', 'Translatable#New Ticket', [], {},
                false, false, 'kix-icon-new-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.CREATE
        ));
    }
}
