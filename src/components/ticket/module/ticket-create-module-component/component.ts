import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService, ActionFactory, DialogService } from '../../../../core/browser';
import { NewTicketDialogContext, TicketCreateAction, TicketWatchAction } from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration,
    WidgetSize
} from '../../../../core/model';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
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
                false, false, WidgetSize.BOTH, 'kix-icon-new-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.CREATE
        ));
    }
}

module.exports = Component;
