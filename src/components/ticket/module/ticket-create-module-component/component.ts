import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ContextService, ActionFactory, DialogService, InitComponent
} from '../../../../core/browser';
import { NewTicketDialogContext, TicketCreateAction } from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../../../core/model';

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {
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

module.exports = Component;
