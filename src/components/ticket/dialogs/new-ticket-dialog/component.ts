import { DialogService } from "../../../../core/browser/dialog/DialogService";
import {
    OverlayService, FormService, ServiceRegistry, ContextService
} from "../../../../core/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult,
    KIXObjectType, ContextMode, ToastContent, TicketProperty, FormInstance
} from "../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketService, TicketDetailsContext, NewTicketDialogContext } from "../../../../core/browser/ticket";
import { RoutingService, RoutingConfiguration } from "../../../../core/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
        const context = await ContextService.getInstance().getContext(NewTicketDialogContext.CONTEXT_ID);
        context.reset();
        await FormService.getInstance().getFormInstance<FormInstance>('new-ticket-form', false);
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, "Ticket wird angelegt");
                const service
                    = ServiceRegistry.getInstance().getServiceInstance<TicketService>(KIXObjectType.TICKET);
                await service.createObjectByForm(KIXObjectType.TICKET, this.state.formId)
                    .then((ticketId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                            ContextMode.DETAILS, TicketProperty.TICKET_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, ticketId);
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showError(error);
                    });
            }
        }, 300);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Ticket wurde erfolgreich angelegt.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    private showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Fehler beim Validieren des Formulars:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Validierungsfehler', true
        );
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

}

module.exports = Component;
