import {
    ServiceRegistry, ContextService, ActionFactory, DialogService
} from '../../../../core/browser';
import {
    TicketFormService, PendingTimeValidator, EmailRecipientValidator, TicketBulkManager,
    EditTicketDialogContext, TicketEditAction
} from '../../../../core/browser/ticket';
import { BulkService } from '../../../../core/browser/bulk';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode,
    ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';
import { AuthenticationSocketClient } from '../../../../core/browser/application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../core/model/UIComponentPermission';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 101;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        if (await this.checkPermissions('tickets/*', [CRUD.UPDATE])) {
            BulkService.getInstance().registerBulkManager(new TicketBulkManager());
        }

        await this.registerContexts();
        await this.registerTicketActions();
        await this.registerTicketDialogs();
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
                'edit-ticket-dialog', 'Translatable#Edit Ticket', [], {}, false, false, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET,
            ContextMode.EDIT
        ));
    }
}
