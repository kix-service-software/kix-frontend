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
    ConfiguredDialogWidget, WidgetConfiguration, WidgetSize, CRUD
} from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';
import { AuthenticationSocketClient } from '../../../../core/browser/application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../core/model/UIComponentPermission';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        if (await this.checkPermissions('tickets/*', [CRUD.UPDATE])) {
            BulkService.getInstance().registerBulkManager(new TicketBulkManager());
        }

        this.registerContexts();
        this.registerTicketActions();
        this.registerTicketDialogs();
    }

    private async checkPermissions(resource: string, crud: CRUD[]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
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
<<<<<<< HEAD
                'edit-ticket-dialog', 'Translatable#Edit Ticket', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-edit'
=======
                'edit-ticket-dialog', 'Translatable#Edit Ticket', [], {}, false, false, 'kix-icon-edit'
>>>>>>> origin/KIX2018-2079
            ),
            KIXObjectType.TICKET,
            ContextMode.EDIT
        ));
    }
}

module.exports = Component;
