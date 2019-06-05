import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, ContextService, ActionFactory, DialogService
} from '../../../../core/browser';
import {
    TicketFormService, PendingTimeValidator, EmailRecipientValidator, TicketBulkManager,
    EditTicketDialogContext, TicketEditAction
} from '../../../../core/browser/ticket';
import { BulkService } from '../../../../core/browser/bulk';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode,
    ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        this.registerContexts();
        this.registerTicketActions();
        this.registerTicketDialogs();
    }

    private registerContexts(): void {
        const editTicketContext = new ContextDescriptor(
            EditTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-ticket-dialog', ['tickets'], EditTicketDialogContext
        );
        ContextService.getInstance().registerContext(editTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-edit-action', TicketEditAction);
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-dialog',
            new WidgetConfiguration(
                'edit-ticket-dialog', 'Translatable#Edit Ticket', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET,
            ContextMode.EDIT
        ));
    }
}

module.exports = Component;
